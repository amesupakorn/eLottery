import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DrawStatus, Prisma } from "@prisma/client";

export const runtime = "nodejs";

// 3 ชั้นรางวัลตามที่กำหนด
const DEFAULT_TIERS = [
  { tier_name: "อันดับที่ 1", prize_amount: new Prisma.Decimal(10_000_000), winners_count: 1 },
  { tier_name: "อันดับที่ 2", prize_amount: new Prisma.Decimal(1_000_000), winners_count: 1 },
  { tier_name: "อันดับที่ 3", prize_amount: new Prisma.Decimal(10_000),    winners_count: 5 },
];

// สร้าง draw_code แบบอ่านง่ายและน่าจะ unique (YYYYMMDD-XXX)
function genDrawCode(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100); // 100..999
  return `${y}${m}${day}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const { draw_code, product_name, seedPrizeTiers } = await req.json().catch(() => ({}));

    // 1) เตรียม draw_code (ถ้าไม่ส่งมาให้)
    let code = typeof draw_code === "string" && draw_code.trim() ? draw_code.trim() : genDrawCode();

    // 2) รับประกัน unique (ลองใหม่สูงสุด 5 ครั้งถ้าชน)
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.draw.findUnique({ where: { draw_code: code } });
      if (!exists) break;
      code = genDrawCode();
      if (i === 4) {
        return NextResponse.json({ error: "Failed to generate unique draw_code" }, { status: 500 });
      }
    }

    // 3) สร้าง draw (สถานะเริ่มต้น SCHEDULED)
    const draw = await prisma.draw.create({
      data: {
        draw_code: code,
        product_name: product_name ?? null,
        status: DrawStatus.SCHEDULED,
      },
    });

    // 4) (ทางเลือก) seed prize tiers = 3 ระดับ ถ้ายังไม่มี
    let seeded = 0;
    if (seedPrizeTiers) {
      await prisma.$transaction(async (tx) => {
        const current = await tx.prizeTier.count({ where: { draw_id: draw.id } });
        if (current === 0) {
          for (const t of DEFAULT_TIERS) {
            await tx.prizeTier.create({ data: { draw_id: draw.id, ...t } });
            seeded++;
          }
        }
      });
    }

    return NextResponse.json(
      {
        message: "Draw created",
        draw: {
          id: draw.id,
          draw_code: draw.draw_code,
          product_name: draw.product_name,
          status: draw.status,
          created_at: draw.created_at,
          prize_tiers_seeded: seeded,
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    // duplicate draw_code ที่ส่งมาเอง
    if (e.code === "P2002") {
      return NextResponse.json({ error: "draw_code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: e?.message ?? "Internal Server Error" }, { status: 500 });
  }
}