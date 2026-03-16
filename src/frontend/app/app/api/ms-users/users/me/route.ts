import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    username: "Mi hogar",
    email: "demo@local"
  });
}
