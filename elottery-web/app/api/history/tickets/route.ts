import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma"; // ปรับให้ตรง alias ของโปรเจกต์คุณ

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = Number(searchParams.get("userId") ?? "1001");
    const q = (searchParams.get("q") ?? "").trim();
    const from = searchParams.get("from"); // YYYY-MM-DD
    const to   = searchParams.get("to");   // YYYY-MM-DD

    // 1) ดึงรายการสลากของ user + ข้อมูลงวด
    const purchases = await prisma.ticketPurchase.findMany({
      where: {
        user_id: userId,
        AND: q ? [{ ticket_number: { contains: q } }] : undefined,
      },
      include: { draw: true },
      orderBy: { id: "desc" },
    });

    // 2) ดึงผลรางวัลของ purchase เหล่านี้
    const purchaseIds = purchases.map((p) => p.id);
    const results = purchaseIds.length
      ? await prisma.drawResult.findMany({
          where: { purchase_item_id: { in: purchaseIds } },
        })
      : [];

    const winByPurchaseId = new Map<number, { prize_amount: string }>();
    for (const r of results) {
      if (r.purchase_item_id != null && !winByPurchaseId.has(r.purchase_item_id)) {
        winByPurchaseId.set(r.purchase_item_id, {
          prize_amount: r.prize_amount.toString(),
        });
      }
    }

    // 3) map → payload แบบหน้า UI (TicketItem[])
    const rawItems = purchases.map((p) => {
      const isWin = winByPurchaseId.has(p.id);
      const status: "OWNED" | "CANCELED" | "WIN" =
        p.status === "CANCELED" ? "CANCELED" : isWin ? "WIN" : "OWNED";

      return {
        id: String(p.id),
        ticketNumber: p.ticket_number,
        product: p.draw?.product_name ?? "สลากดิจิทัล",
        status,
        price: Number(p.unit_price),
        // schema ปัจจุบันไม่มีเวลาใน purchase → ใช้เวลางวดแทน
        purchasedAt: (p.draw?.created_at ?? new Date()).toISOString(),
      };
    });

    // 4) กรองช่วงวันที่/ข้อความฝั่ง API (เสริม)
    const items = rawItems.filter((it) => {
      const t = new Date(it.purchasedAt).getTime();
      const okFrom = from ? t >= new Date(`${from}T00:00:00`).getTime() : true;
      const okTo   = to   ? t <= new Date(`${to}T23:59:59.999`).getTime() : true;
      const kw = q.toLowerCase();
      const okQ =
        !kw ||
        it.ticketNumber.includes(kw) ||
        it.product.toLowerCase().includes(kw) ||
        it.status.toLowerCase().includes(kw);
      return okFrom && okTo && okQ;
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("GET /api/history/tickets error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
