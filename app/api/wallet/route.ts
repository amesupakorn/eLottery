import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { user_id: user.id },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
      },
      balance: wallet ? Number(wallet.balance) : 0,
      currency: wallet?.currency ?? "THB",
    });
  } catch (e) {
    console.error("GET /api/wallet error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}