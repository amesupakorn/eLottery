import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

export async function GET() {
  const prisma = new PrismaClient();
  const data = await prisma.user.findMany();
  await prisma.$disconnect(); // ✅ ปิด connection
  return NextResponse.json(data);
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId")) || 1001; // ใช้ user จำลอง
    const q = searchParams.get("q")?.trim() || "";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // หา wallet ของ user
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
    });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // สร้างเงื่อนไขการค้นหา
    const where: any = { wallet_id: wallet.id };
    if (q) {
      where.OR = [
        { note: { contains: q, mode: "insensitive" } },
        { ref_code: { contains: q, mode: "insensitive" } },
      ];
    }
    if (from || to) {
      where.occurred_at = {
        gte: from ? new Date(`${from}T00:00:00Z`) : undefined,
        lte: to ? new Date(`${to}T23:59:59Z`) : undefined,
      };
    }

    // ดึงรายการธุรกรรม
    const transactions = await prisma.accountTransaction.findMany({
      where,
      orderBy: { occurred_at: "desc" },
    });

    return NextResponse.json({
      wallet,
      transactions,
    });
  } catch (err: any) {
    console.error("Error in /api/history:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
