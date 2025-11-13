import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// 3 ชั้นรางวัล
const DEFAULT_TIERS = [
  { tier_name: "อันดับที่ 1", prize_amount: 10_000_000, winners_count: 1 },
  { tier_name: "อันดับที่ 2", prize_amount: 1_000_000, winners_count: 1 },
  { tier_name: "อันดับที่ 3", prize_amount: 10_000,    winners_count: 5 },
];

function genDrawCode(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${y}${m}${day}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const { draw_code, product_name, seedPrizeTiers } = await req.json().catch(() => ({}));

    // 1) draw_code
    let code = draw_code?.trim?.() || genDrawCode();

    // 2) Unique check
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.draw.findUnique({ where: { draw_code: code } });
      if (!exists) break;
      code = genDrawCode();
      if (i === 4) {
        return NextResponse.json({ error: "Failed to generate unique draw_code" }, { status: 500 });
      }
    }

    // 3) Create draw
    const draw = await prisma.draw.create({
      data: {
        draw_code: code,
        product_name: product_name ?? null,
        status: "SCHEDULED",     // ใช้ string literal แทน enum Prisma
      },
    });

    // 4) prize tiers
    let seeded = 0;
    if (seedPrizeTiers) {
      await prisma.$transaction(async (tx: {
          prizeTier: {
            count: (arg0: { where: { draw_id: any; }; }) => any; create: (arg0: {
              data: {
                draw_id: any; tier_name: string; prize_amount: number; // เป็น number ปลอดภัย
                winners_count: number;
              };
            }) => any;
          };
        }) => {
        const current = await tx.prizeTier.count({ where: { draw_id: draw.id } });
        if (current === 0) {
          for (const t of DEFAULT_TIERS) {
            await tx.prizeTier.create({
              data: {
                draw_id: draw.id,
                tier_name: t.tier_name,
                prize_amount: t.prize_amount, // เป็น number ปลอดภัย
                winners_count: t.winners_count,
              },
            });
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
    if (e.code === "P2002") {
      return NextResponse.json({ error: "draw_code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: e?.message ?? "Internal Server Error" }, { status: 500 });
  }
}