import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const amt = new Decimal(amount ?? 0);
    if (amt.lte(0)) {
      return NextResponse.json({ error: "จำนวนเงินไม่ถูกต้อง" }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { user_id: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "ไม่พบกระเป๋าเงินของผู้ใช้" },
        { status: 404 }
      );
    }

    const current = new Decimal(wallet.balance.toString());
    if (current.lt(amt)) {
      return NextResponse.json({ error: "ยอดเงินไม่เพียงพอ" }, { status: 400 });
    }

    const after = current.minus(amt);

    const result = await prisma.$transaction(async (tx: { accountTransaction: { create: (arg0: { data: { wallet_id: any; entry_type: string; direction: string; amount: Decimal; balance_after: Decimal; note: string; }; }) => any; }; wallet: { update: (arg0: { where: { id: any; }; data: { balance: Decimal; updated_at: Date; }; }) => any; }; }) => {
      const trx = await tx.accountTransaction.create({
        data: {
          wallet_id: wallet.id,           
          entry_type: "WITHDRAWAL",
          direction: "CREDIT",             
          amount: amt,
          balance_after: after,
          note: `ถอนเงินโดย ${user.full_name ?? user.email}`,
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: after, updated_at: new Date() },
      });

      return { trx, updatedWallet };
    });

    return NextResponse.json({
      message: "ถอนเงินสำเร็จ",
      balance: result.updatedWallet.balance,
      transaction: result.trx,
      amount: amount
    });
  } catch (err) {
    console.error("❌ Withdraw error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}