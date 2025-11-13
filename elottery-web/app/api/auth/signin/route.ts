// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; 

const cognito = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION!,
});

// SECRET_HASH = Base64( HMAC_SHA256( key=CLIENT_SECRET, data=USERNAME + CLIENT_ID ) )
function getSecretHash(username: string): string | undefined {
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  const clientId = process.env.COGNITO_CLIENT_ID;
  if (!clientSecret || !clientId) return undefined;

  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const params: InitiateAuthCommandInput = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const secretHash = getSecretHash(email);
    if (secretHash) {
      params.AuthParameters!["SECRET_HASH"] = secretHash;
    }

    const authRes = await cognito.send(new InitiateAuthCommand(params));

    // ถ้า Cognito ต้องการ challenge (เช่น เปลี่ยนรหัสครั้งแรก/MFA) จะยังไม่มี token
    if (authRes.ChallengeName) {
      return NextResponse.json(
        {
          error: "Challenge required",
          challenge: authRes.ChallengeName,
          session: authRes.Session, // ฝั่ง client นำไปใช้ตอบ challenge ต่อ
        },
        { status: 401 }
      );
    }

    const token = authRes.AuthenticationResult;
    if (!token?.IdToken) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // ดึงข้อมูล user จาก DB (หรือจะ upsert ให้ sync กับ Cognito ก็ได้)
    const dbUser = await prisma.user.findUnique({ where: { email } });

    const res = NextResponse.json({
      message: "Login successful",
      user: {
        email,
        name: dbUser?.full_name ?? null,
        notify_opt: dbUser?.notify_opt ?? false,
      },
    });
    
    const isProd = process.env.NODE_ENV === 'production';
    const isCloud9 = /vfs\.cloud9\./i.test(req.headers.get('host') ?? '');
    
    res.cookies.set('id_token', token.IdToken!, {
      httpOnly: true,
      secure: isProd || isCloud9,          // Cloud9 preview เป็น HTTPS
      sameSite: isCloud9 ? 'none' : 'lax', // iFrame ต้อง None
      path: '/',
      maxAge: token.ExpiresIn,             // วินาทีจาก Cognito
    });

    // (ถ้าต้องการ ใช้ AccessToken/RefreshToken ก็ set เพิ่มอีก 2 cookie)
    // if (token.AccessToken) res.cookies.set("access_token", token.AccessToken, { ... });
    // if (token.RefreshToken) res.cookies.set("refresh_token", token.RefreshToken, { ... });

    return res;
  } catch (err: any) {
    // map ข้อผิดพลาดที่พบบ่อย
    const name = err?.name || "";
    const msg =
      name === "NotAuthorizedException"
        ? "Invalid email or password"
        : name === "UserNotConfirmedException"
        ? "User not confirmed. Please verify your email."
        : name === "UserNotFoundException"
        ? "User not found"
        : "Internal server error";
    const code =
      name === "NotAuthorizedException" || name === "UserNotFoundException"
        ? 401
        : name === "UserNotConfirmedException"
        ? 403
        : 500;

    return NextResponse.json({ error: msg }, { status: code });
  }
}