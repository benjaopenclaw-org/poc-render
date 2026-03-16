import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type RequestInitWithBody = RequestInit & { body?: BodyInit | null };

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getPetsApiBaseUrl(): string {
  return getRequiredEnv("MS_PETS_API_URL");
}

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get("access_token")?.value ?? null;
}

export async function proxyToPetsApi(
  request: NextRequest,
  path: string,
  init?: RequestInitWithBody
): Promise<Response> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ message: "No authenticated session was found." }, { status: 401 });
  }

  const headers = new Headers(init?.headers ?? request.headers);
  headers.set("authorization", `Bearer ${accessToken}`);

  if (init?.body) {
    headers.set("content-type", "application/json");
  }

  return fetch(`${getPetsApiBaseUrl()}${path}`, {
    method: init?.method ?? request.method,
    headers,
    body: init?.body,
    cache: "no-store"
  });
}

export async function proxyJson<T>(response: Response): Promise<NextResponse<T | { message: string }>> {
  const text = await response.text();

  if (!text) {
    return new NextResponse(null, { status: response.status });
  }

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json"
    }
  }) as NextResponse<T | { message: string }>;
}
