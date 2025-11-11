import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // import client จากที่เราสร้างไว้
import { Decimal } from '@prisma/client/runtime/library'; // ใช้สำหรับคำนวณ Decimal

/**
 * @desc    API Endpoint สำหรับการซื้อสลาก (Create Purchase)
 * @route   POST /api/purchases
 * @access  Private (ควรมีการยืนยันตัวตน User ในระบบจริง)
 * @body    {
 * "userId": number,
 * "drawId": number,
 * "rangeStart": number,
 * "rangeEnd": number
 * }
 */
const DEFAULT_START_NUMBER = 100000;
const UNIT_PRICE = new Decimal(100.00);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("--- SERVER RECEIVED BODY ---", body);
    const { userId, drawCode, quantity} = body;

    // --- 1. ตรวจสอบข้อมูลเบื้องต้น ---
    if (!userId || !drawCode || !quantity) {
      console.error("--- VALIDATION FAILED! (Missing fields) ---"); // <-- Log ที่ 2
      return NextResponse.json(
        { message: 'Missing required fields (userId, drawCode, quantity)' },
        { status: 400 }
      );
    }

      console.log("--- VALIDATION 1 PASSED ---"); 
      // ❗️❗️ -------------------------- ❗️❗️

    if (quantity <= 0) {
       console.error("--- VALIDATION FAILED! (Quantity <= 0) ---"); // <-- Log ที่ 4
       return NextResponse.json(
        { message: 'Quantity must be greater than zero' },
        { status: 400 }
      );
    }

    const draw = await prisma.draw.findUnique({
      where: { draw_code: drawCode },
      select: { id: true, status: true },
    });

    if (!draw) {
      return NextResponse.json({ message: 'Draw not found' }, { status: 404 });
    }
    // --- 2. คำนวณราคาสลาก (ใน Mock นี้, สมมติว่าใบละ 80) ---
    // ในระบบจริง คุณอาจจะต้องดึงราคามาจาก Draw หรือ Product


    const totalPrice = new Decimal(quantity).times(UNIT_PRICE);

    // 💡 3.1. ค้นหาเลขที่ซื้อไปล่าสุดในงวดนี้
    const lastPurchase = await prisma.ticketPurchase.findFirst({
      where: { draw_id: draw.id },
      orderBy: { range_end: 'desc' }, // เอาอันที่ range_end มากที่สุด
      select: { range_end: true },
    });

    const newRangeStart = lastPurchase
      ? lastPurchase.range_end + 1
      : DEFAULT_START_NUMBER;

    const newRangeEnd = newRangeStart + quantity - 1;

    // --- 3. ดำเนินการ Transaction ---
    // ใช้ $transaction เพื่อให้แน่ใจว่าทุกขั้นตอนสำเร็จ หรือไม่ก็ล้มเหลวทั้งหมด
    const purchaseResult = await prisma.$transaction(async (tx) => {
      // 3.1. ค้นหา Wallet ของ User และเช็คยอดเงิน
      const wallet = await tx.wallet.findUnique({
        where: { user_id: userId },
      });

      if (!wallet) {
        throw new Error('Wallet not found'); // Error นี้จะถูก catch ด้านนอก
      }

      // 3.2. เปรียบเทียบยอดเงิน
      const currentBalance = new Decimal(wallet.balance);
      if (currentBalance.lt(totalPrice)) { // lt = less than
        throw new Error('Insufficient funds');
      }

      const newBalance = currentBalance.minus(totalPrice);

      // 3.3. อัปเดตยอดเงินใน Wallet (DEBIT)
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          updated_at: new Date(),
        },
      });

      // 3.4. สร้าง Log การทำรายการ (AccountTransaction)
      await tx.accountTransaction.create({
        data: {
          wallet_id: wallet.id,
          entry_type: 'PURCHASE',
          amount: totalPrice,
          direction: 'DEBIT',
          balance_after: newBalance,
          ref_code: `PURCHASE-${Date.now()}`, // สร้าง ref_code แบบง่ายๆ
          note: `Purchase ${quantity} units for draw ${drawCode} (Range: ${newRangeStart}-${newRangeEnd})`,
        },
      });

      // 3.5. สร้างรายการซื้อ (TicketPurchase)
      const newPurchase = await tx.ticketPurchase.create({
        data: {
          range_start: newRangeStart,
          range_end: newRangeEnd,
          unit_price: UNIT_PRICE,
          total_price: totalPrice,
          status: 'OWNED', // ตั้งสถานะเป็น 'OWNED' เมื่อสำเร็จ
          user_id: userId,
          wallet_id: wallet.id,
          draw_id: draw.id,
          purchased_at: new Date(),
        },
      });

      return newPurchase; // คืนค่าตั๋วที่ซื้อสำเร็จ
    });

    // --- 4. ส่งผลลัพธ์กลับ ---
    // ถ้า transaction สำเร็จ
    return NextResponse.json(purchaseResult, { status: 201 }); // 201 Created

  } catch (error: any) {
    // --- 5. จัดการ Error ---
    // ถ้า Error มาจาก Logic ของเรา (เช่น เงินไม่พอ)
    if (error.message === 'Insufficient funds') {
      return NextResponse.json({ message: 'Insufficient funds' }, { status: 400 });
    }
    if (error.message === 'Wallet not found') {
      return NextResponse.json({ message: 'Wallet not found' }, { status: 404 });
    }

    // ถ้าเป็น Error จาก Prisma หรืออื่นๆ
    console.error('Purchase API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}