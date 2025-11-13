import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDraw } from "@/lib/draw_ticket/draw";

export const runtime = "nodejs";

const DEFAULT_TIERS = [
  { tier_name: "อันดับที่ 1", prize_amount: 10_000_000, winners_count: 1 },
  { tier_name: "อันดับที่ 2", prize_amount: 1_000_000, winners_count: 1 },
  { tier_name: "อันดับที่ 3", prize_amount: 10_000,    winners_count: 5 },
];

const PRIZE_NOTIFY_API_URL = process.env.PRIZE_NOTIFY_API_URL;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const pad6 = (n: number) => n.toString().padStart(6, "0");

export async function POST(_req: NextRequest) {
  const draw = await getCurrentDraw();
  if (!draw) {
    return NextResponse.json({ error: "No current draw" }, { status: 404 });
  }

  if (!["SCHEDULED", "LOCKED"].includes(draw.status)) {
    return NextResponse.json(
      { error: `Invalid status: ${draw.status}` },
      { status: 400 }
    );
  }

  // กัน run ซ้ำ
  const exist = await prisma.drawResult.findFirst({
    where: { draw_id: draw.id },
  });
  if (exist) {
    return NextResponse.json(
      { error: "Results already exist" },
      { status: 409 }
    );
  }

  // seed tiers ถ้ายังไม่มี
  if (!draw.prizeTiers || draw.prizeTiers.length === 0) {
    await prisma.$transaction(async (tx: { prizeTier: { create: (arg0: { data: { tier_name: string; prize_amount: number; winners_count: number; draw_id: any; }; }) => any; }; }) => {
      for (const t of DEFAULT_TIERS) {
        await tx.prizeTier.create({
          data: { draw_id: draw.id, ...t },
        });
      }
    });
  }

  const tiers = await prisma.prizeTier.findMany({
    where: { draw_id: draw.id },
    orderBy: { id: "asc" },
  });

  // set DRAWING
  await prisma.draw.update({
    where: { id: draw.id },
    data: { status: "DRAWING" },
  });

  // สุ่มเลขไม่ซ้ำ
  const used = new Set<string>();
  const picks: {
    prize_tier_id: number;
    ticket_number: string;
    prize_amount: number; // <-- ใช้ number แทน Decimal
    tier_name?: string;
  }[] = [];

  for (const tier of tiers) {
    for (let i = 0; i < tier.winners_count; i++) {
      let ticket: string;
      do {
        const n = randInt(1, 100000); // 1..100000
        ticket = pad6(n - 1);         // 000000..099999
      } while (used.has(ticket));
      used.add(ticket);

      picks.push({
        prize_tier_id: tier.id,
        ticket_number: ticket,
        prize_amount: Number(tier.prize_amount), // แปลงเป็น number ครั้งเดียว
        tier_name: tier.tier_name,
      });
    }
  }

  // บันทึกผล
  await prisma.$transaction(async (tx: { drawResult: { create: (arg0: { data: { draw_id: any; prize_tier_id: number; ticket_number: string; prize_amount: number; }; }) => any; }; }) => {
    for (const p of picks) {
      await tx.drawResult.create({
        data: {
          draw_id: draw.id,
          prize_tier_id: p.prize_tier_id,
          ticket_number: p.ticket_number,
          prize_amount: p.prize_amount, // Prisma จะ cast number → Decimal เอง
        },
      });
    }

    // ถ้าจะอัปเดตสถานะเป็น PUBLISHED หลังจับเสร็จ ให้ใช้ enum ใน schema:
    // await tx.draw.update({
    //   where: { id: draw.id },
    //   data: { status: "PUBLISHED" },
    // });
  });

  // เรียก API Gateway → Lambda → SNS (แจ้งผลออกรางวัล)
  if (PRIZE_NOTIFY_API_URL) {
    try {
      const notifyBody = {
        drawId: draw.id,
        drawCode: draw.draw_code,
        productName: draw.product_name,
        winners: picks.map((p) => ({
          tier_name: p.tier_name,
          ticket_number: p.ticket_number,
          prize_amount: p.prize_amount, // number พร้อมส่งไป JSON
        })),
      };

      const res = await fetch(PRIZE_NOTIFY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifyBody),
      });

      if (!res.ok) {
        console.error("Prize notify failed:", await res.text());
      }
    } catch (err) {
      console.error("Error calling PRIZE_NOTIFY_API_URL:", err);
    }
  } else {
    console.warn("PRIZE_NOTIFY_API_URL is not set, skipping SNS notify");
  }

  return NextResponse.json({
    message: "Drawn",
    drawId: draw.id,
    winners: picks.map((p) => ({
      tier_name: p.tier_name,
      ticket_number: p.ticket_number,
    })),
  });
}