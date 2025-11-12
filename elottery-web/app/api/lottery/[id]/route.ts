import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const userid = id;
  try {
    
    const tickets = await prisma.ticketPurchase.findMany({
      where: {
        user_id:  Number(userid), // 4. ใช้ ID จาก URL
        status: 'OWNED',
      },
      include: {
        Draw: {
          select: { draw_code: true }
        }
      },
      orderBy: {
        purchased_at: 'desc'
      }
    });


    return NextResponse.json(tickets);
  } catch (error: any) {
    // ... (error handling)
  }
}