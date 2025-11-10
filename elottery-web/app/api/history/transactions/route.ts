import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma"; // ปรับให้ตรง alias ของโปรเจกต์คุณ

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = Number(searchParams.get("userId") ?? "1001");
    const q = (searchParams.get("q") ?? "").trim();
    const from = searchParams.get("from"); // YYYY-MM-DD
    const to   = searchParams.get("to");   // YYYY-MM-DD

    // หา wallet ของ user
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
    });
    if (!wallet) {
      return NextResponse.json({ items: [] });
    }

    // ดึงธุรกรรม
    const txs = await prisma.accountTransaction.findMany({
      where: {
        wallet_id: wallet.id,
        AND: [
          from ? { occurred_at: { gte: new Date(`${from}T00:00:00`) } } : {},
          to   ? { occurred_at: { lte: new Date(`${to}T23:59:59.999`) } } : {},
          q
            ? {
                OR: [
                  { note: { contains: q, mode: "insensitive" } },
                  { ref_code: { contains: q, mode: "insensitive" } },
                  // เผื่อผู้ใช้พิมพ์ชนิดรายการ เช่น "deposit", "withdrawal" ฯลฯ
                  { entry_type: { equals: q.toUpperCase() as any } },
                ],
              }
            : {},
        ],
      },
      orderBy: { occurred_at: "desc" },
    });

    // map เป็น payload แบบหน้า UI ใช้ (LedgerItem[])
    const items = txs.map((t) => ({
      id: String(t.id),
      // UI ใช้ "WITHDRAW": แปลงจาก WITHDRAWAL → WITHDRAW
      type: (t.entry_type === "WITHDRAWAL" ? "WITHDRAW" : t.entry_type) as any,
      amount: Number(t.amount) * (t.direction === "DEBIT" ? -1 : 1),
      note: t.note ?? "",
      occurredAt: t.occurred_at.toISOString(),
    }));

    return NextResponse.json({ items });
  } catch (e) {
    console.error("GET /api/history/transactions error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
