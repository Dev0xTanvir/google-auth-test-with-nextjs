"use server";

import type { GoogleAuthActionState } from "@/lib/backend-types";

export async function verifyGoogleIdToken(
  _prevState: GoogleAuthActionState,
  formData: FormData,
): Promise<GoogleAuthActionState> {
  const idToken = formData.get("idToken");

  if (typeof idToken !== "string" || idToken.length === 0) {
    return {
      status: "error",
      message: "No Google ID token found. Sign in with Google first.",
    };
  }

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";

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

  return {
    status: "success",
    data: {
      message: json.message,
      user: json.data.user,
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
    },
  };
}
