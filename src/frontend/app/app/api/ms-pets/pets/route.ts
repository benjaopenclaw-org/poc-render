import { NextRequest } from "next/server";
import { proxyJson, proxyToPetsApi } from "../../../../src/server/backend-proxy";
import { PetRecord } from "../../../../src/pets/types";

export async function GET(request: NextRequest) {
  const response = await proxyToPetsApi(request, "/pets");
  return proxyJson<PetRecord[]>(response);
}

export async function POST(request: NextRequest) {
  const response = await proxyToPetsApi(request, "/pets", {
    method: "POST",
    body: await request.text()
  });
  return proxyJson<PetRecord>(response);
}
