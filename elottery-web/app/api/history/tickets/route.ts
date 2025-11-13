import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
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

    // ⭐ include Receipt เพื่อดึงใบเสร็จ
    const purchases = await prisma.ticketPurchase.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: { id: "desc" },
      include: {
        Receipt: true,         // 👈 เพิ่มตรงนี้
      },
    });

    if (!purchases.length) {
      return NextResponse.json({ items: [] });
    }

    // ⭐ ดึง draw ที่เกี่ยวข้อง
    const drawIds = Array.from(
      new Set(purchases.map((p: { draw_id: any; }) => p.draw_id).filter((id: any): id is number => id !== null))
    );

    const draws = await prisma.draw.findMany({
      where: { id: { in: drawIds } },
    });
    const drawById = new Map(draws.map((d: { id: any; }) => [d.id, d]));

    // ⭐ ดึงผลรางวัล
    const purchaseIds = purchases.map((p: { id: any; }) => p.id);
    const results = await prisma.drawResult.findMany({
      where: { purchase_item_id: { in: purchaseIds } },
    });

    const winByPurchaseId = new Map<number, { prize_amount: number }>();
    for (const r of results) {
      if (r.purchase_item_id != null && !winByPurchaseId.has(r.purchase_item_id)) {
        winByPurchaseId.set(r.purchase_item_id, {
          prize_amount: Number(r.prize_amount),
        });
      }
    }

    // ⭐ Map → UI payload
    const rawItems = purchases.map((p: { draw_id: unknown; id: number; status: string; range_start: any; range_end: any; total_price: any; purchased_at: any; Receipt: { receipt_id: any; }; }) => {
      const d = p.draw_id != null ? drawById.get(p.draw_id) : undefined;
      const isWin = winByPurchaseId.has(p.id);
      const status: "OWNED" | "CANCELED" | "WIN" =
        p.status === "CANCELED" ? "CANCELED" : isWin ? "WIN" : "OWNED";

      const ticketNumber =
        p.range_start === p.range_end
          ? String(p.range_start)
          : `${p.range_start} - ${p.range_end}`;

      return {
        id: String(p.id),
        ticketNumber,
        product: "สลากดิจิทัล",
        status,
        price: Number(p.total_price),
        purchasedAt: p.purchased_at,
        receiptId: p.Receipt?.receipt_id ?? null,   // 👈 ส่ง receipt id กลับ UI
      };
    });

    // ⭐ กรองช่วงวัน
    const items = rawItems.filter((it: { purchasedAt: string | number | Date; }) => {
      const t = new Date(it.purchasedAt).getTime();
      const okFrom = from ? t >= new Date(`${from}T00:00:00`).getTime() : true;
      const okTo = to ? t <= new Date(`${to}T23:59:59.999`).getTime() : true;
      return okFrom && okTo;
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("GET /api/history/tickets error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}