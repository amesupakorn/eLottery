// app/api/receipts/open/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.S3_BUCKET!;
const s3 = new S3Client({ region: REGION });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const receiptId = searchParams.get("receiptId");

    if (!receiptId) {
      return NextResponse.json(
        { error: "receiptId is required" },
        { status: 400 }
      );
    }

    const rec = await prisma.receipt.findUnique({
      where: { receipt_id: receiptId },
    });

    if (!rec) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const key = rec.s3_key;
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn: 300 } // 5 นาที
    );

    // จะ redirect ไป S3 ก็ได้
    return NextResponse.redirect(url);
    // หรือถ้าอยากส่งเป็น JSON ก็:
    // return NextResponse.json({ downloadUrl: url });
  } catch (err) {
    console.error("Open receipt error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}