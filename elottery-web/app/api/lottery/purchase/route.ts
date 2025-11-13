import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { getCurrentUser } from "@/lib/auth/getCurrentUser"; // <- ใช้ของคุณ

// ปรับตามจริงถ้าราคาอยู่ที่ Product/Draw
const DEFAULT_START_NUMBER = 100000;
const UNIT_PRICE = new Decimal(100.0);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { drawCode, quantity } = body as {
      drawCode?: string;
      quantity?: number;
    };

    // 1) auth ผู้ใช้จาก cookie/JWT
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2) validate input
    if (!drawCode || !quantity) {
      return NextResponse.json(
        { message: "Missing required fields (drawCode, quantity)" },
        { status: 400 }
      );
    }
    if (quantity <= 0) {
      return NextResponse.json(
        { message: "Quantity must be greater than zero" },
        { status: 400 }
      );
    }

    // 3) หา draw
    const draw = await prisma.draw.findUnique({
      where: { draw_code: drawCode },
      select: { id: true, status: true },
    });
    if (!draw) {
      return NextResponse.json({ message: "Draw not found" }, { status: 404 });
    }

    const totalPrice = new Decimal(quantity).times(UNIT_PRICE);

    // 4) ทำทุกอย่างใน transaction เพื่อกัน race condition
    const purchaseResult = await prisma.$transaction(async (tx: { wallet: { findUnique: (arg0: { where: { user_id: any; }; }) => any; update: (arg0: { where: { id: any; }; data: { balance: Decimal; updated_at: Date; }; }) => any; }; ticketPurchase: { findFirst: (arg0: { where: { draw_id: any; }; orderBy: { range_end: string; }; select: { range_end: boolean; }; }) => any; create: (arg0: { data: { range_start: any; range_end: number; unit_price: Decimal; total_price: Decimal; status: string; user_id: any; wallet_id: any; draw_id: any; purchased_at: Date; }; }) => any; }; accountTransaction: { create: (arg0: { data: { wallet_id: any; entry_type: string; amount: Decimal; direction: string; balance_after: Decimal; ref_code: string; note: string; }; }) => any; }; }) => {
      // 4.1) หา wallet ของ user
      const wallet = await tx.wallet.findUnique({
        where: { user_id: user.id },
      });
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // 4.2) เช็คยอดเงินพอไหม
      const currentBalance = new Decimal(wallet.balance);
      if (currentBalance.lt(totalPrice)) {
        throw new Error("Insufficient funds");
      }

      // 4.3) หาเลขช่วงล่าสุดในงวดนี้ (ทำใน tx เพื่อความถูกต้อง)
      const lastPurchase = await tx.ticketPurchase.findFirst({
        where: { draw_id: draw.id },
        orderBy: { range_end: "desc" },
        select: { range_end: true },
      });

      const newRangeStart = lastPurchase
        ? lastPurchase.range_end + 1
        : DEFAULT_START_NUMBER;
      const newRangeEnd = newRangeStart + quantity - 1;

      const newBalance = currentBalance.minus(totalPrice);

      // 4.4) ตัดเงินจาก wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          updated_at: new Date(),
        },
      });

      // 4.5) ลงบัญชี (DEBIT)
      await tx.accountTransaction.create({
        data: {
          wallet_id: wallet.id,
          entry_type: "PURCHASE",
          amount: totalPrice,
          direction: "DEBIT",
          balance_after: newBalance,
          ref_code: `PURCHASE-${Date.now()}`,
          note: `Purchase ${quantity} units for draw ${drawCode} (Range: ${newRangeStart}-${newRangeEnd})`,
        },
      });

      // 4.6) บันทึกการซื้อ
      const newPurchase = await tx.ticketPurchase.create({
        data: {
          range_start: newRangeStart,
          range_end: newRangeEnd,
          unit_price: UNIT_PRICE,
          total_price: totalPrice,
          status: "OWNED",
          user_id: user.id,       
          wallet_id: wallet.id,
          draw_id: draw.id,
          purchased_at: new Date(),
        },
      });

      return newPurchase;
    });

    return NextResponse.json(purchaseResult, { status: 201 });
  } catch (error: any) {
    if (error.message === "Insufficient funds") {
      return NextResponse.json({ message: "Insufficient funds" }, { status: 400 });
    }
    if (error.message === "Wallet not found") {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }
    console.error("Purchase API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}