// app/api/receipts/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { buildPurchaseReceiptPDF } from "@/lib/pdf/receipt";

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.S3_BUCKET!;
const PREFIX = process.env.S3_PREFIX ?? "receipts/";

const s3 = new S3Client({ region: REGION });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      receiptId,
      purchaseId,
      userId,
      drawId,
      drawCode,
      productName,
      quantity,
      unitPrice,
      rangeStart,
      rangeEnd,
      buyerName,
      buyerEmail,
    } = body;

    if (!receiptId || !purchaseId || !userId) {
      return NextResponse.json(
        { error: "Missing receiptId / purchaseId / userId" },
        { status: 400 }
      );
    }

    // 1) สร้าง PDF buffer
    const pdfBuffer = await buildPurchaseReceiptPDF({
      receiptId,
      drawCode,
      productName: productName ?? "Digital Lottery Ticket",
      quantity: Number(quantity ?? 0),
      unitPrice: Number(unitPrice ?? 0),
      rangeStart: Number(rangeStart ?? 0),
      rangeEnd: Number(rangeEnd ?? 0),
      buyerName: buyerName ?? "-",
      buyerEmail: buyerEmail ?? "-",
    });

    // 2) อัปโหลดขึ้น S3
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const key = `${PREFIX}${yyyy}/${mm}/${receiptId}.pdf`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    );

    // 3) บันทึกลงตาราง Receipt
    const rec = await prisma.receipt.create({
      data: {
        receipt_id: receiptId,
        user_id: userId,
        draw_id: drawId ?? null,
        s3_key: key,
        total_amount: Number(unitPrice) * Number(quantity),
        purchase_id: purchaseId 
      },
    });

    // 4) สร้าง presigned URL ให้โหลดครั้งแรก
    const downloadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: BUCKET, Key: key }), // หรือ GetObjectCommand ถ้าดาวน์โหลด
      { expiresIn: 600 }
    );

    return NextResponse.json({
      receiptId: rec.receipt_id,
      key,
      downloadUrl,
    });
  } catch (err) {
    console.error("Generate receipt error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}