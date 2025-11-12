import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { getCurrentUser } from "@/lib/auth/getCurrentUser"; // ✅ ใช้ helper ที่เราแยกไว้

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" },
        { status: 401 }
      );
    }

    console.log("📥 Deposit request:", { userId: user.id, amount });

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "จำนวนเงินไม่ถูกต้อง" },
        { status: 400 }
      );
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

    const currentBalance = new Decimal(wallet.balance.toString());
    const depositAmount = new Decimal(amount.toString());
    const newBalance = currentBalance.plus(depositAmount);

    console.log("🧮 Balance calculation:", {
      current: currentBalance.toString(),
      deposit: depositAmount.toString(),
      new: newBalance.toString(),
    });

    // ✅ บันทึกธุรกรรม (Transaction)
    const transaction = await prisma.accountTransaction.create({
      data: {
        wallet_id: wallet.id,
        entry_type: "DEPOSIT",
        direction: "DEBIT",
        amount: depositAmount,
        balance_after: newBalance,
        note: `ฝากเงินโดย ${user.full_name}`,
      },
    });

    // ✅ อัปเดตยอด wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: newBalance,
        updated_at: new Date(),
      },
    });

    console.log("✅ Deposit successful:", updatedWallet);

    return NextResponse.json({
      message: "ฝากเงินสำเร็จ",
      newBalance: newBalance.toString(),
      wallet: updatedWallet,
      transaction,
    });
  } catch (error) {
    console.error("❌ Deposit error:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดภายในระบบ",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}