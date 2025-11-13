import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDraw } from "@/lib/draw_ticket/draw";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const draw = await getCurrentDraw();
  if (!draw) return NextResponse.json({ error: "No current draw" }, { status: 404 });

  // อนุญาตให้ lock เฉพาะ SCHEDULED (หรือ LOCKED ซ้ำได้ถ้าต้องการ)
  if (draw.status !== "SCHEDULED" && draw.status !== "LOCKED") {
    return NextResponse.json({ error: `Invalid status: ${draw.status}` }, { status: 400 });
  }

  const updated = await prisma.draw.update({
    where: { id: draw.id },
    data: { status: "LOCKED" },
  });

  return NextResponse.json({ message: "Locked", drawId: updated.id, status: updated.status });
}