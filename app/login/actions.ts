"use server";

import { cookies } from "next/headers";

import type { GoogleAuthActionState } from "@/lib/backend-types";

export async function loginWithGoogle(
  _prevState: GoogleAuthActionState,
  idToken: string,
): Promise<GoogleAuthActionState> {
  if (typeof idToken !== "string" || idToken.length === 0) {
    return {
      status: "error",
      message: "No Google ID token found. Sign in with Google first.",
    };
  }

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    });
  } catch {
    return {
      status: "error",
      message: `Could not reach backend at ${backendUrl}. Is the server running?`,
    };
  }

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    return {
      status: "error",
      message: json?.message ?? `Backend responded with status ${res.status}`,
    };
  }

  console.log(json);

  const { accessToken, refreshToken, user, message } = json.data;

  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return {
    status: "success",
    data: { message, user, accessToken, refreshToken },
  };
}
