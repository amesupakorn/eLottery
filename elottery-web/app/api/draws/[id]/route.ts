import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const drawId = Number(params.id);
    if (isNaN(drawId)) {
      return NextResponse.json({ error: "Invalid draw ID" }, { status: 400 });
    }

    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        prizeTiers: true,
        results: {
          include: {
            prizeTier: true,
          },
          orderBy: [{ prize_tier_id: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    const data = {
      id: draw.id,
      draw_code: draw.draw_code,
      product_name: draw.product_name,
      status: draw.status,
      created_at: draw.created_at,
      prize_tiers: draw.prizeTiers.map((t) => ({
        id: t.id,
        name: t.tier_name,
        prize_amount: t.prize_amount,
        winners_count: t.winners_count,
      })),
      results: draw.results.map((r) => ({
        id: r.id,
        prize_tier: r.prizeTier.tier_name,
        ticket_number: r.ticket_number,
        prize_amount: r.prize_amount,
        user_id: r.user_id,
        purchase_item_id: r.purchase_item_id,
        published_at: r.published_at,
      })),
    };

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}