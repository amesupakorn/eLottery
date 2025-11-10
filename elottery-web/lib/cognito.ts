// src/lib/cognito.ts
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

// ====== ENV CONFIG ======
const REGION = process.env.COGNITO_REGION!;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET || "";

// ====== CLIENT ======
export const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

// ====== UTIL ======
/**
 * สร้างค่า SECRET_HASH สำหรับ client ที่มี secret
 */
export function getSecretHash(username: string): string | undefined {
  if (!CLIENT_SECRET) return undefined;
  const hmac = crypto.createHmac("sha256", CLIENT_SECRET);
  hmac.update(username + CLIENT_ID);
  return hmac.digest("base64");
}

/**
 * สมัครสมาชิกผู้ใช้ใหม่ (SignUp)
 */
export async function signUpUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string;
}) {
  const params: any = {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name || "" },
    ],
  };
  const secret = getSecretHash(email);
  if (secret) params.SecretHash = secret;

  const command = new SignUpCommand(params);
  return await cognitoClient.send(command);
}

/**
 * ยืนยันการสมัครด้วยรหัส OTP (ConfirmSignUp)
 */
export async function confirmUser({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  const params: any = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  };
  const secret = getSecretHash(email);
  if (secret) params.SecretHash = secret;

  const command = new ConfirmSignUpCommand(params);
  return await cognitoClient.send(command);
}

/**
 * เข้าสู่ระบบด้วย email / password (Login)
 */
export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const params: any = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };
  const secret = getSecretHash(email);
  if (secret) params.AuthParameters.SECRET_HASH = secret;

  const command = new InitiateAuthCommand(params);
  return await cognitoClient.send(command);
}

/**
 * ออกจากระบบ (GlobalSignOut)
 */
export async function logoutUser(accessToken: string) {
  const command = new GlobalSignOutCommand({ AccessToken: accessToken });
  return await cognitoClient.send(command);
}