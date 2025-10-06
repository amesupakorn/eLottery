import { NextRequest, NextResponse } from "next/server";
import { confirmUser } from "@/lib/cognito";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and confirmation code are required" },
        { status: 400 }
      );
    }

    await confirmUser({ email, code });

    return NextResponse.json(
      { message: "Account confirmed successfully!" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Confirm error:", err);

    const name = err.name || "";
    const message =
      name === "CodeMismatchException"
        ? "Invalid confirmation code."
        : name === "ExpiredCodeException"
        ? "Confirmation code expired. Please request a new one."
        : name === "UserNotFoundException"
        ? "User not found."
        : "Confirmation failed.";

    const status =
      name === "CodeMismatchException" ? 400 :
      name === "ExpiredCodeException" ? 400 :
      name === "UserNotFoundException" ? 404 :
      500;

    return NextResponse.json({ error: message }, { status });
  }
}