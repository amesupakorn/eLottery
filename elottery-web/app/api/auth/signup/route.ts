import { NextRequest, NextResponse } from "next/server";
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { prisma } from "@/lib/prisma";

const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
});

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // ✅ 1. เรียก AWS Cognito สร้าง user
    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
      ],
    });

    const response = await client.send(command);

    await prisma.user.create({
      data: {
        email,
        full_name: name,
        cognito_sub: response.UserSub, // เก็บ sub จาก Cognito
      },
    });

    // ✅ 3. ส่งกลับว่า signup สำเร็จ
    return NextResponse.json(
      { message: "Signup successful", cognitoSub: response.UserSub },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Signup error:", err);
    if (err.name === "UsernameExistsException") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}