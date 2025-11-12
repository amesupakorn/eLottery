import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { buildPurchaseReceiptPDF } from "@/lib/pdf/receipt";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.S3_BUCKET!;
const PREFIX = process.env.S3_PREFIX ?? "receipts/";

const s3 = new S3Client({ region: REGION });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body ที่ต้องการ (ปรับตามจริง/ข้อมูลจาก DB)
    // {
    //   receiptId, drawCode, productName, quantity, unitPrice, rangeStart, rangeEnd,
    //   buyerName, buyerEmail, purchasedAt?, verifyUrl?
    // }
    if (!body?.receiptId) {
      return NextResponse.json({ error: "Missing receiptId" }, { status: 400 });
    }

    // 1) สร้างไฟล์ PDF เป็น Buffer
    const pdfBuffer = await buildPurchaseReceiptPDF({
      receiptId: body.receiptId,
      drawCode: body.drawCode,
      productName: body.productName ?? "สลากดิจิทัล",
      quantity: Number(body.quantity ?? 0),
      unitPrice: Number(body.unitPrice ?? 0),
      rangeStart: Number(body.rangeStart ?? 0),
      rangeEnd: Number(body.rangeEnd ?? 0),
      buyerName: body.buyerName ?? "-",
      buyerEmail: body.buyerEmail ?? "-",
      purchasedAt: body.purchasedAt ? new Date(body.purchasedAt) : undefined,
      verifyUrl: body.verifyUrl,
    });

    // 2) อัปโหลด S3 โดยตรง
    const yyyy = new Date().getFullYear();
    const mm = String(new Date().getMonth() + 1).padStart(2, "0");
    const objectKey = `${PREFIX}${yyyy}/${mm}/${body.receiptId}.pdf`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: objectKey,
        Body: pdfBuffer,
        ContentType: "application/pdf",
        // แนะนำให้เก็บแบบ private แล้วแจกเป็น presigned GET URL แทน
        ACL: "private",
      })
    );

    // 3) สร้าง presigned GET สำหรับดาวน์โหลด (เช่น 10 นาที)
    const presignedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: objectKey }),
        { expiresIn: 600 }
    );

    return NextResponse.json({
      message: "Receipt generated & uploaded",
      bucket: BUCKET,
      key: objectKey,
      downloadUrl: presignedUrl,
    });
  } catch (err: any) {
    console.error("Generate receipt error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}