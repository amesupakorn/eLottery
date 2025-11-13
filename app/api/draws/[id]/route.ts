import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
        results: true,
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
      prize_tiers: draw.prizeTiers,
      results: draw.results,
    });
  } catch (e) {
    console.error("GET /api/draws/[id] error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}