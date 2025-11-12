import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = Number(searchParams.get("userId") ?? "1001");
    const q = (searchParams.get("q") ?? "").trim();
    const from = searchParams.get("from"); // YYYY-MM-DD
    const to   = searchParams.get("to");   // YYYY-MM-DD

    // 1) ดึงรายการซื้อสลากของผู้ใช้ (ไม่มี include เพราะไม่ได้ประกาศ relation ใน schema)
    const purchases = await prisma.ticketPurchase.findMany({
      where: {
        user_id: userId,
        ...(q
          ? { ticket_number: { contains: q } }
          : {}),
      },
      orderBy: { id: "desc" },
    });

    if (!purchases.length) {
      return NextResponse.json({ items: [] });
    }

    // 2) ดึง Draw ที่เกี่ยวข้องด้วย draw_id แล้วทำ map
    const drawIds = Array.from(new Set(purchases.map(p => p.draw_id)));
    const draws = await prisma.draw.findMany({
      where: { id: { in: drawIds } },
    });
    const drawById = new Map(draws.map(d => [d.id, d]));

    // 3) ดึงผลรางวัลของ purchase เหล่านี้เพื่อระบุ WIN
    const purchaseIds = purchases.map(p => p.id);
    const results = await prisma.drawResult.findMany({
      where: { purchase_item_id: { in: purchaseIds } },
    });
    const winByPurchaseId = new Map<number, { prize_amount: number }>();
    for (const r of results) {
      if (r.purchase_item_id != null && !winByPurchaseId.has(r.purchase_item_id)) {
        winByPurchaseId.set(r.purchase_item_id, { prize_amount: Number(r.prize_amount) });
      }
    }

    // 4) map → payload สำหรับ UI (TicketItem[])
    const rawItems = purchases.map(p => {
      const d = drawById.get(p.draw_id);
      const isWin = winByPurchaseId.has(p.id);
      const status: "OWNED" | "CANCELED" | "WIN" =
        p.status === "CANCELED" ? "CANCELED" : isWin ? "WIN" : "OWNED";

      return {
        id: String(p.id),
        ticketNumber: p.ticket_number,
        product: d?.product_name ?? "สลากดิจิทัล",
        status,
        price: Number(p.unit_price),
        // ใช้เวลางวดเป็น purchasedAt (เพราะ schema ไม่มีเวลาใน purchase)
        purchasedAt: (d?.created_at ?? new Date()).toISOString(),
      };
    });

    // 5) กรองช่วงวัน/ข้อความ (เสริม)
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
