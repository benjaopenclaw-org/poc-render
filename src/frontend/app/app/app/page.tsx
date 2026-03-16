"use client";

import dynamic from "next/dynamic";

const PetsApp = dynamic(() => import("../components/pets-app").then((module) => module.PetsApp), {
  ssr: false,
  loading: () => <div className="page-loader">Cargando panel de mascotas...</div>
});

export default function PetsPage() {
  return <PetsApp />;
}
