// app/api/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId") ?? "1001");

    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
    });

    return NextResponse.json({
      balance: wallet ? Number(wallet.balance) : 0,
      currency: wallet?.currency ?? "THB",
    });
  } catch (e) {
    console.error("GET /api/wallet error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
