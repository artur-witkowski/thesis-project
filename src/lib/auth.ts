"use server";

import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-key-for-development";

const TOKEN_EXPIRATION = "8h";

export async function createToken(
  data: Record<string, unknown>
): Promise<string> {
  const secretKey = new TextEncoder().encode(JWT_SECRET);

  return await new jose.SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(secretKey);
}

export async function verifyToken(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jose.jwtVerify(token, secretKey);

    return payload as Record<string, unknown>;
  } catch (error: unknown) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function setAuthCookie(
  name: string,
  data: Record<string, unknown>
): Promise<void> {
  const token = await createToken(data);

  (await cookies()).set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60,
    path: "/",
    sameSite: "strict",
  });
}

export async function getAuthCookie(
  name: string
): Promise<Record<string, unknown> | null> {
  const cookie = (await cookies()).get(name);

  if (!cookie?.value) {
    return null;
  }

  return verifyToken(cookie.value);
}

export async function removeAuthCookie(
  name: string = "admin-session"
): Promise<void> {
  (await cookies()).delete(name);
}

export async function getIsAuthenticated(
  cookieName: string = "admin-session"
): Promise<boolean> {
  const data = await getAuthCookie(cookieName);
  return !!data;
}
