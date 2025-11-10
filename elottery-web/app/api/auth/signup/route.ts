import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUpUser } from "@/lib/cognito";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const response = await signUpUser({ email, password, name });

    await prisma.user.create({
      data: {
        email,
        full_name: name,
        cognito_sub: response.UserSub,
      },
    });

    return NextResponse.json(
      {
        message: "Signup successful! Please confirm your email.",
        email,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Signup error:", err);

    const name = err.name || "";
    const message =
      name === "UsernameExistsException"
        ? "Email already registered."
        : name === "InvalidPasswordException"
        ? "Password does not meet the security requirements."
        : name === "InvalidParameterException"
        ? "Invalid parameters provided."
        : "Internal Server Error";

    const status =
      name === "UsernameExistsException" ? 400 :
      name === "InvalidPasswordException" ? 400 :
      name === "InvalidParameterException" ? 400 :
      500;

    return NextResponse.json({ error: message }, { status });
  }
}