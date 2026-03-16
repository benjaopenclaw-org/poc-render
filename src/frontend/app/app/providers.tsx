"use client";

import { AuthProvider } from "@rekodi/react-auth";
import { PropsWithChildren } from "react";
import { authClient } from "../src/auth/auth-client";

export function Providers({ children }: PropsWithChildren) {
  return <AuthProvider client={authClient}>{children}</AuthProvider>;
}
