import { handleSession } from "../../../../src/auth/server-auth";

export async function GET(request: Request) {
  return handleSession(request);
}
