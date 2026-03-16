import { handleCallback } from "../../src/auth/server-auth";

export async function GET(request: Request) {
  return handleCallback(request);
}

export async function POST(request: Request) {
  return handleCallback(request);
}
