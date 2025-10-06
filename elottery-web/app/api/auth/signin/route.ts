// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION!,
});

function getSecretHash(username: string) {
  const secret = process.env.COGNITO_CLIENT_SECRET;
  if (!secret) return undefined;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(username + process.env.COGNITO_CLIENT_ID);
  return hmac.digest("base64");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const params: any = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const hash = getSecretHash(email);
    if (hash) params.AuthParameters.SECRET_HASH = hash;

    const authRes = await cognito.send(new InitiateAuthCommand(params));
    const token = authRes.AuthenticationResult;

    if (!token) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const res = NextResponse.json({ message: "Login successful" });
    res.cookies.set("id_token", token.IdToken!, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: token.ExpiresIn,
    });
    return res;
  } catch (err: any) {
    const msg =
      err.name === "NotAuthorizedException"
        ? "Invalid email or password"
        : err.name === "UserNotConfirmedException"
        ? "User not confirmed. Please verify your email."
        : err.name === "UserNotFoundException"
        ? "User not found"
        : "Internal server error";
    const code =
      err.name === "NotAuthorizedException" || err.name === "UserNotFoundException"
        ? 401
        : err.name === "UserNotConfirmedException"
        ? 403
        : 500;

    return NextResponse.json({ error: msg }, { status: code });
  }
}