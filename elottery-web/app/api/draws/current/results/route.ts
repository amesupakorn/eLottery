import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDraw } from "@/lib/draw_ticket/draw";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const draw = await getCurrentDraw();
  if (!draw) return NextResponse.json({ error: "No current draw" }, { status: 404 });

  const data = await prisma.drawResult.findMany({
    where: { draw_id: draw.id },
    include: { prizeTier: true },
    orderBy: [{ prize_tier_id: "asc" }, { id: "asc" }],
  });

  return NextResponse.json({
    drawId: draw.id,
    status: draw.status,
    results: data.map(r => ({
      number: r.ticket_number,
      prizeTier: r.prizeTier.tier_name,
      amount: r.prize_amount,
      user_id: r.user_id ?? null,
      purchase_item_id: r.purchase_item_id ?? null,
    })),
  });
}