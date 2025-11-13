// app/api/draws/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const drawId = Number(id);
    if (Number.isNaN(drawId)) {
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400 }
      );
    }

    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        prizeTiers: true,
        results: {
          include: {
            prizeTier: true,  // << ดึง relation prizeTier มาด้วย
          },
        },
      },
    });

    if (!draw) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
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
        ticket_number: r.ticket_number,
        prize_amount: r.prize_amount,
        // 👇 เพิ่ม field ที่ UI ใช้ group
        prize_tier: r.prizeTier?.tier_name ?? null,
      })),
    });
  } catch (e) {
    console.error("GET /api/draws/[id] error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}