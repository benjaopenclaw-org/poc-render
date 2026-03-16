"use client";

import { PetsDashboard } from "./pets-dashboard";
import { Providers } from "../providers";

export function PetsApp() {
  return (
    <Providers>
      <PetsDashboard />
    </Providers>
  );
}
