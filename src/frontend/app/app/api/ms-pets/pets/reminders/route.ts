import { NextRequest } from "next/server";
import { proxyJson, proxyToPetsApi } from "../../../../../src/server/backend-proxy";
import { PetReminder } from "../../../../../src/pets/types";

export async function GET(request: NextRequest) {
  const response = await proxyToPetsApi(request, "/pets/reminders");
  return proxyJson<PetReminder[]>(response);
}
