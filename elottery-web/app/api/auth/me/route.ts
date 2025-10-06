import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("id_token")?.value;
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const decoded = jwt.decode(token) as any;
  if (decoded.exp * 1000 < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }

  return NextResponse.json({ user: decoded });
}