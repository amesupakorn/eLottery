import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ ปรับ path ให้ตรงของโปรเจกต์
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const wallet = await prisma.wallet.findUnique({
      where: { user_id: user.id },
    });
    if (!wallet) {
      return NextResponse.json({ items: [] });
    }

    const txs = await prisma.accountTransaction.findMany({
      where: {
        wallet_id: wallet.id,
        AND: [
          from ? { occurred_at: { gte: new Date(`${from}T00:00:00`) } } : {},
          to ? { occurred_at: { lte: new Date(`${to}T23:59:59.999`) } } : {},
        ],
      },
      orderBy: { occurred_at: "desc" },
    });

    const items = txs.map((t: { id: any; entry_type: string; amount: any; direction: string; note: any; occurred_at: { toISOString: () => any; }; }) => ({
      id: String(t.id),
      type: (t.entry_type === "WITHDRAWAL" ? "WITHDRAW" : t.entry_type) as
        | "DEPOSIT"
        | "WITHDRAW"
        | "PRIZE"
        | "PURCHASE"
        | "REFUND",
      amount: Number(t.amount) * (t.direction === "CREDIT" ? 1 : -1),
      note: t.note ?? "",
      occurredAt: t.occurred_at.toISOString(),
    }));

    return NextResponse.json({ items });
  } catch (e) {
    console.error("GET /api/history/transactions error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}