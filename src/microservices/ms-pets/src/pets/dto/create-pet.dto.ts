import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min
} from "class-validator";
import { PetHealthStatus, PetVaccinationStatus } from "../pet.entity";

export class CreatePetDto {
  @IsString()
  name!: string;

  @IsString()
  species!: string;

  @IsString()
  breed!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  ageYears!: number;

  @IsEnum(["healthy", "attention", "checkup"])
  healthStatus!: PetHealthStatus;

  @IsEnum(["up_to_date", "pending", "overdue"])
  vaccinationStatus!: PetVaccinationStatus;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: "photoUrl must be a valid URL." })
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  nextCareAt?: string | null;
}
