import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET(
  request: Request) {

  const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

  try {
    const tickets = await prisma.ticketPurchase.findMany({
      where: {
        user_id: user.id,
        status: "OWNED",
      },
      include: {
        Draw: {
          select: { draw_code: true },
        },
      },
      orderBy: {
        purchased_at: "desc",
      },
    });

    const totalValue = tickets.reduce((sum: number, t: { total_price: any; }) => {
      return sum + Number(t.total_price || 0);
    }, 0);

    return NextResponse.json({
      user_id: user.id,
      total_value: totalValue,
      count: tickets.length,
      tickets,
    });
  } catch (error: any) {
    console.error("GET /tickets error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}