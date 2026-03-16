import { NextResponse } from "next/server";
import { getAccessToken } from "../../../../../src/server/backend-proxy";

export async function GET() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ message: "No authenticated session was found." }, { status: 401 });
  }

  const authUrl = process.env.OAUTH2_AUTH_URL;

  if (!authUrl) {
    return NextResponse.json({ message: "Missing OAUTH2_AUTH_URL environment variable." }, { status: 500 });
  }

  const response = await fetch(`${authUrl}/userinfo`, {
    headers: {
      authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json"
    }
  });
}
