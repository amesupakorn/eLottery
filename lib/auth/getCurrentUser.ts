import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("id_token")?.value;
  if (!token) return null;

  const decoded = jwt.decode(token) as { email?: string; name?: string } | null;
  const email = decoded?.email;
  if (!email) return null;

  return prisma.user.findUnique({ where: { email } });
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("Unauthorized");
    throw err;
  }
  return user;
}