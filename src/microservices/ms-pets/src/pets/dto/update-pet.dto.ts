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

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  species?: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  ageYears?: number;

  @IsOptional()
  @IsEnum(["healthy", "attention", "checkup"])
  healthStatus?: PetHealthStatus;

  @IsOptional()
  @IsEnum(["up_to_date", "pending", "overdue"])
  vaccinationStatus?: PetVaccinationStatus;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: "photoUrl must be a valid URL." })
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  nextCareAt?: string | null;
}
