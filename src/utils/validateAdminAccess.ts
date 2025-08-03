// src/utils/validateAdminAccess.ts
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function validateAdminAccess(req: NextRequest): Promise<boolean> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const apiKey = req.headers.get("x-api-key");

  const isAdmin = token?.role === "admin";
  const isValidKey = apiKey === process.env.ADMIN_API_KEY;

  console.log("Session:", token);
  console.log("API Key:", apiKey);
  return isAdmin || isValidKey;
}
