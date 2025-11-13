import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDraw } from "@/lib/draw_ticket/draw";
import { Decimal } from "@prisma/client/runtime/library"; 

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  // 1) โหลด draw ปัจจุบัน
  const draw = await getCurrentDraw();
  if (!draw) {
    return NextResponse.json({ error: "No current draw" }, { status: 404 });
  }

  if (draw.status !== "DRAWING") {
    return NextResponse.json(
      { error: `Invalid status: ${draw.status}, must be DRAWING` },
      { status: 400 }
    );
  }

  if (!draw.results || draw.results.length === 0) {
    return NextResponse.json({ error: "No results to publish" }, { status: 400 });
  }

  // 2) ดึงเลขสลากที่ถูกรางวัลเป็น number[]
  const winningNumbers = draw.results
    .map((r: { ticket_number: any; }) => Number(r.ticket_number))
    .filter((n: number) => !isNaN(n));

  if (!winningNumbers.length) {
    return NextResponse.json({ error: "No valid winning numbers" }, { status: 400 });
  }

  // 3) หา TicketPurchase ที่ช่วงเลขครอบ winningNumbers (ใช้ range_start / range_end)
  const winners = await prisma.ticketPurchase.findMany({
    where: {
      draw_id: draw.id,
      status: "OWNED",
      OR: winningNumbers.map((num: any) => ({
        range_start: { lte: num },
        range_end: { gte: num },
      })),
    },
    select: {
      id: true,
      user_id: true,
      wallet_id: true,
      range_start: true,
      range_end: true,
    },
  });

  if (!winners.length) {
    // ไม่มีคนถูกรางวัลเลย แต่ก็เปลี่ยนเป็น PUBLISHED ได้
    await prisma.draw.update({
      where: { id: draw.id },
      data: { status: "PUBLISHED" },
    });

    return NextResponse.json({
      message: "Published (no winners)",
      drawId: draw.id,
    });
  }

  // เอาไว้หาว่าตั๋วไหนครอบเลขรางวัล
  const winnerList = winners;

  // 4) จ่ายเงินและอัปเดต drawResult + wallet ภายใน transaction
  await prisma.$transaction(async (tx:any) => {
    for (const r of draw.results) {
      const winNum = Number(r.ticket_number);
      if (isNaN(winNum)) continue;

      // หา purchase ที่ช่วงเลขครอบ winNum
      const purchase = winnerList.find(
        (p: { range_start: number; range_end: number; }) => p.range_start <= winNum && p.range_end >= winNum
      );
      if (!purchase) continue;

      // โหลด wallet
      const wallet = await tx.wallet.findUnique({
        where: { id: purchase.wallet_id },
      });
      if (!wallet) continue;

      // ใช้ Prisma.Decimal แบบถูกต้อง
      const current = new Decimal(wallet.balance);
      const prize = new Decimal(r.prize_amount);
      const newBalance = current.add(prize);

      // สร้าง AccountTransaction โดยใช้ relation wallet แทน wallet_id ตรง ๆ
      await tx.accountTransaction.create({
        data: {
          wallet: { connect: { id: wallet.id } },
          entry_type: "PRIZE",
          direction: "CREDIT",
          amount: prize,
          balance_after: newBalance,
          ref_code: `PRIZE-${draw.draw_code}`,
          note: `Prize for ticket number ${r.ticket_number}`,
          occurred_at: new Date(),
        },
      });

      // อัปเดตยอด wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          updated_at: new Date(),
        },
      });

      // ผูกผลรางวัลกับ user + ticketPurchase
      await tx.drawResult.update({
        where: { id: r.id },
        data: {
          user_id: purchase.user_id,
          purchase_item_id: purchase.id,
        },
      });
    }

    // เปลี่ยนสถานะ draw เป็น PUBLISHED
    await tx.draw.update({
      where: { id: draw.id },
      data: { status: "PUBLISHED" }, // ใช้ string ตรง ๆ เลี่ยง enum export ปลอม
    });
  });

  return NextResponse.json({
    message: "Published",
    drawId: draw.id,
  });
}