import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    const userId = 1; // mock id (ภายหลังใช้ session หรือ JWT ได้)

    console.log('📥 Deposit request:', { userId, amount });

    // Validation
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "จำนวนเงินไม่ถูกต้อง" }, 
        { status: 400 }
      );
    }

    // หา wallet ของ user - เปิด comment นี้
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
    });

    console.log('💰 Found wallet:', wallet);

    // ตรวจสอบว่ามี wallet
    if (!wallet) {
      return NextResponse.json(
        { error: "ไม่พบกระเป๋าเงิน" }, 
        { status: 404 }
      );
    }

    // ตรวจสอบ balance
    if (wallet.balance === undefined || wallet.balance === null) {
      console.error('❌ Balance is invalid:', wallet);
      return NextResponse.json(
        { error: "ยอดเงินในกระเป๋าไม่ถูกต้อง" }, 
        { status: 500 }
      );
    }

    // คำนวณยอดใหม่
    const currentBalance = new Decimal(wallet.balance.toString());
    const depositAmount = new Decimal(amount.toString());
    const newBalance = currentBalance.plus(depositAmount);

    console.log('🧮 Balance calculation:', {
      current: currentBalance.toString(),
      deposit: depositAmount.toString(),
      new: newBalance.toString()
    });

    // บันทึก Transaction
    const transaction = await prisma.accountTransaction.create({
      data: {
        wallet_id: wallet.id,
        entry_type: "DEPOSIT",
        direction: "DEBIT",
        amount: depositAmount,
        balance_after: newBalance,
        note: "ฝากเงินเข้าระบบ",
      },
    });

    // อัปเดตยอด wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { 
        balance: newBalance, 
        updated_at: new Date() 
      },
    });

    console.log('✅ Deposit successful:', updatedWallet);

    return NextResponse.json({ 
      message: "ฝากเงินสำเร็จ", 
      newBalance: newBalance.toString(),
      wallet: updatedWallet,
      transaction
    });

  } catch (error) {
    console.error('❌ Deposit error:', error);
    return NextResponse.json(
      { 
        error: "เกิดข้อผิดพลาดภายในระบบ",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}