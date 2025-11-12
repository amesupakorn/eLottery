import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDraw } from "@/lib/draw_ticket/draw";
import { DrawStatus, Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const draw = await getCurrentDraw();
  if (!draw) return NextResponse.json({ error: "No current draw" }, { status: 404 });
  if (draw.status !== DrawStatus.DRAWING) {
    return NextResponse.json({ error: `Invalid status: ${draw.status}` }, { status: 400 });
  }
  if (!draw.results || draw.results.length === 0) {
    return NextResponse.json({ error: "No results to publish" }, { status: 400 });
  }

  const winningNumbers = draw.results
    .map(r => r.ticket_number!)
    .filter(Boolean) as string[];

  const winners = await prisma.ticketPurchase.findMany({
    where: {
      draw_id: draw.id,
      status: "OWNED",
      ticket_number: { in: winningNumbers },
    },
    select: { id: true, user_id: true, wallet_id: true, ticket_number: true },
  });
  const byNumber = new Map<string, typeof winners[number]>();
  winners.forEach(w => byNumber.set(w.ticket_number, w));

  await prisma.$transaction(async (tx) => {
    for (const r of draw.results) {
      if (!r.ticket_number) continue;
      const matched = byNumber.get(r.ticket_number);
      if (!matched) continue;

      const wallet = await tx.wallet.findUnique({ where: { id: matched.wallet_id } });
      if (!wallet) continue;

      const newBalance = new Prisma.Decimal(wallet.balance).add(new Prisma.Decimal(r.prize_amount));

      await tx.accountTransaction.create({
        data: {
          wallet_id: matched.wallet_id,
          entry_type: "PRIZE",
          ref_code: `DRAW-${draw.id}`,
          amount: r.prize_amount,
          direction: "CREDIT",
          balance_after: newBalance,
          occurred_at: new Date(),
          note: `Prize for ${r.ticket_number}`,
        },
      });

      await tx.wallet.update({
        where: { id: matched.wallet_id },
        data: { balance: newBalance, updated_at: new Date() },
      });

      await tx.drawResult.update({
        where: { id: r.id },
        data: { user_id: matched.user_id, purchase_item_id: matched.id },
      });
    }

    await tx.draw.update({ where: { id: draw.id }, data: { status: DrawStatus.PUBLISHED } });
  });

  return NextResponse.json({ message: "Published", drawId: draw.id });
}