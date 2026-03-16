export type PetHealthStatus = "healthy" | "attention" | "checkup";
export type PetVaccinationStatus = "up_to_date" | "pending" | "overdue";

export type PetRecord = {
  id: string;
  name: string;
  species: string;
  breed: string;
  ageYears: number;
  healthStatus: PetHealthStatus;
  vaccinationStatus: PetVaccinationStatus;
  notes: string;
  photoUrl: string;
  nextCareAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PetSummary = {
  totalPets: number;
  vaccinatedPets: number;
  petsNeedingAttention: number;
  speciesBreakdown: Array<{
    species: string;
    total: number;
    healthy: number;
    attention: number;
  }>;
};

export type PetReminder = {
  id: string;
  petId: string;
  petName: string;
  species: string;
  nextCareAt: string;
  message: string;
};

export type PetFormValues = {
  name: string;
  species: string;
  breed: string;
  ageYears: number;
  healthStatus: PetHealthStatus;
  vaccinationStatus: PetVaccinationStatus;
  photoUrl: string;
  nextCareAt: string;
  notes: string;
};

export const defaultPetFormValues: PetFormValues = {
  name: "",
  species: "Perro",
  breed: "",
  ageYears: 1,
  healthStatus: "healthy",
  vaccinationStatus: "up_to_date",
  photoUrl: "",
  nextCareAt: "",
  notes: ""
};
