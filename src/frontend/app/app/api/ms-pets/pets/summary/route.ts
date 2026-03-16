import { NextRequest } from "next/server";
import { proxyJson, proxyToPetsApi } from "../../../../../src/server/backend-proxy";
import { PetSummary } from "../../../../../src/pets/types";

export async function GET(request: NextRequest) {
  const response = await proxyToPetsApi(request, "/pets/summary");
  return proxyJson<PetSummary>(response);
}
