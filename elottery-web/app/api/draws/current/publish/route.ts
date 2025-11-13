import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDraw } from "@/lib/draw_ticket/draw";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const Decimal = prisma.$extends({}).Decimal;
  const draw = await getCurrentDraw();
  if (!draw) return NextResponse.json({ error: "No current draw" }, { status: 404 });
  if (draw.status !== "DRAWING") {
    return NextResponse.json({ error: `Invalid status: ${draw.status}` }, { status: 400 });
  }
  if (!draw.results || draw.results.length === 0) {
    return NextResponse.json({ error: "No results to publish" }, { status: 400 });
  }

  const winningNumbers = draw.results
    .map((r: { ticket_number: any; }) => r.ticket_number!)
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
  winners.forEach((w: { ticket_number: string; }) => byNumber.set(w.ticket_number, w));

  await prisma.$transaction(async (tx: { wallet: { findUnique: (arg0: { where: { id: any; }; }) => any; update: (arg0: { where: { id: any; }; data: { balance: any; updated_at: Date; }; }) => any; }; accountTransaction: { create: (arg0: { data: { wallet_id: any; entry_type: string; ref_code: string; amount: any; direction: string; balance_after: any; occurred_at: Date; note: string; }; }) => any; }; drawResult: { update: (arg0: { where: { id: any; }; data: { user_id: any; purchase_item_id: any; }; }) => any; }; draw: { update: (arg0: { where: { id: any; }; data: { status: any; }; }) => any; }; }) => {
    for (const r of draw.results) {
      if (!r.ticket_number) continue;
      const matched = byNumber.get(r.ticket_number);
      if (!matched) continue;

      const wallet = await tx.wallet.findUnique({ where: { id: matched.wallet_id } });
      if (!wallet) continue;

      const newBalance = new Decimal(wallet.balance).add(new Decimal(r.prize_amount));

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

    await tx.draw.update({ where: { id: draw.id }, data: { status: "PUBLISHED" } });
  });

  return NextResponse.json({ message: "Published", drawId: draw.id });
}