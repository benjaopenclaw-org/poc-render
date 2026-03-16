import { NextRequest } from "next/server";
import { proxyJson, proxyToPetsApi } from "../../../../../src/server/backend-proxy";
import { PetRecord } from "../../../../../src/pets/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await proxyToPetsApi(request, `/pets/${id}`, {
    method: "PATCH",
    body: await request.text()
  });
  return proxyJson<PetRecord>(response);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await proxyToPetsApi(request, `/pets/${id}`, {
    method: "DELETE"
  });
  return proxyJson<void>(response);
}
