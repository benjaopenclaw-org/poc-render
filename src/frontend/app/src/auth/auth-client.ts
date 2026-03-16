"use client";

import { createRekodiAuthClient } from "@rekodi/react-auth";

export const authClient = createRekodiAuthClient({
  appBaseUrl: typeof window === "undefined" ? "" : window.location.origin,
  loginUrl: "/api/auth/login",
  logoutUrl: "/api/auth/logout",
  sessionUrl: "/api/auth/session",
  currentUserUrl: "/api/ms-users/users/me",
  storage: "memory"
});
