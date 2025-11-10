import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const userid = id;

  const currentBalance = await prisma.wallet.findUnique({
    where: { user_id: Number(userid) },
  });

  return Response.json(currentBalance);
}



export async function POST (
    request: NextRequest,
    context: { params: Promise<{ id: string }> } 
  ){
    const { id } = await context.params;
    const userid = id;
    const { amount, paymentMethod } = await request.json();

    const newBalance = await prisma.wallet.update({
        where: { user_id: Number(userid) },
        data: {
            balance: { decrement: Number(amount) }
        }
    })

    const Transaction = await prisma.accountTransaction.create({
        data: {
            wallet_id: Number(userid),
            entry_type: 'WITHDRAWAL',
            ref_code: `WD-${Date.now()}`,
            amount: Number(amount),
            direction: 'DEBIT',
            balance_after: newBalance.balance,
            note: `ถอนเงินผ่านธนาคาร ${paymentMethod}`
        }
    })

    return Response.json({ newBalance });
}

