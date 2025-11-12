import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const apiUrl = process.env.SUBSCRIBE_API_URL; 
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("id_token")?.value;
  if (!token) return null;

  const decoded: any = jwt.decode(token);
  const email = decoded?.email;
  if (!email) return null;

  return prisma.user.findUnique({ where: { email } });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { optIn } = await req.json(); 

    if (typeof optIn !== "boolean") {
      return NextResponse.json({ error: "optIn must be boolean" }, { status: 400 });
    }

    if (!user.email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    if (optIn === true) {
      if (!apiUrl) {
        console.error("SUBSCRIBE_API_URL is not set");
        return NextResponse.json({ error: "SNS endpoint not configured" }, { status: 500 });
      }

      // 1) เรียก Lambda ผ่าน API Gateway ให้ไป subscribe email เข้า SNS
      const snsRes = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!snsRes.ok) {
        console.error("SNS subscribe failed:", await snsRes.text());
        return NextResponse.json({ error: "SNS subscribe failed" }, { status: 500 });
      }

      // 2) อัปเดตสถานะใน DB
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { notify_opt: true },
      });

      return NextResponse.json({
        message: "Updated and SNS processed",
        notify_opt: updated.notify_opt,
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { notify_opt: false },
    });

    return NextResponse.json({
      message: "Updated (opt-out)",
      notify_opt: updated.notify_opt,
    });
  } catch (e) {
    console.error("notification/settings error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}