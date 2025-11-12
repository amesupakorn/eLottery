import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const draws = await prisma.draw.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { created_at: "desc" },
      include: {
        prizeTiers: true,
        _count: { select: { results: true } },
      },
    });

    const formatted = draws.map((d) => ({
      id: d.id,
      draw_code: d.draw_code,
      product_name: d.product_name,
      status: d.status,
      prize_tiers: d.prizeTiers.map((t) => ({
        name: t.tier_name,
        amount: t.prize_amount,
        count: t.winners_count,
      })),
      total_results: d._count.results,
      created_at: d.created_at,
    }));

    return NextResponse.json({ draws: formatted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}