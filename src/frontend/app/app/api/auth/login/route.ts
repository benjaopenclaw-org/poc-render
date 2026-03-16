import { handleLogin } from "../../../../src/auth/server-auth";

export async function GET(request: Request) {
  return handleLogin(request);
}
