import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // (ตรวจสอบว่า Path นี้ถูกต้อง)

const DEFAULT_START_NUMBER = 100000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const drawCode = searchParams.get('drawCode');
    const quantityStr = searchParams.get('quantity');
    
    const quantity = Number(quantityStr);

    if (!drawCode || !quantity || quantity <= 0) {
      return NextResponse.json(
        { message: 'Missing or invalid drawCode or quantity' },
        { status: 400 }
      );
    }

    // 1. ค้นหา Draw ID
    const draw = await prisma.draw.findUnique({
      where: { draw_code: drawCode },
      select: { id: true },
    });

    let rangeStart = DEFAULT_START_NUMBER;

    // 2. ถ้ามีงวดนี้อยู่จริง ให้ค้นหาเลขสุดท้าย
    if (draw) {
      const lastPurchase = await prisma.ticketPurchase.findFirst({
        where: { draw_id: draw.id },
        orderBy: { range_end: 'desc' },
        select: { range_end: true },
      });
      
      if (lastPurchase) {
        rangeStart = lastPurchase.range_end + 1;
      }
    }
    // (ถ้า draw ไม่มีอยู่จริง ก็จะใช้ DEFAULT_START_NUMBER)

    // 3. คำนวณเลขสุดท้าย
    const rangeEnd = rangeStart + quantity - 1;

    // 4. ส่งค่ากลับไป
    return NextResponse.json({ rangeStart, rangeEnd });

  } catch (error: any) {
    console.error('Preview API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}