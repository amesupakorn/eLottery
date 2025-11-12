import { prisma } from "@/lib/prisma";
import { DrawStatus } from "@prisma/client";

export async function getCurrentDraw() {
  // 1) กำลังจับอยู่
  const drawing = await prisma.draw.findFirst({
    where: { status: DrawStatus.DRAWING },
    orderBy: { created_at: "desc" },
    include: { prizeTiers: true, results: true },
  });
  if (drawing) return drawing;

  // 2) ล็อกไว้แล้ว
  const locked = await prisma.draw.findFirst({
    where: { status: DrawStatus.LOCKED },
    orderBy: { created_at: "desc" },
    include: { prizeTiers: true, results: true },
  });
  if (locked) return locked;

  // 3) เตรียมไว้ (scheduled) ล่าสุด
  const scheduled = await prisma.draw.findFirst({
    where: { status: DrawStatus.SCHEDULED },
    orderBy: { created_at: "desc" },
    include: { prizeTiers: true, results: true },
  });
  return scheduled; // อาจเป็น null ถ้ายังไม่มีงวดเลย
}