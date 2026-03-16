import { handleLogout } from "../../../../src/auth/server-auth";

export async function GET() {
  return handleLogout();
}
