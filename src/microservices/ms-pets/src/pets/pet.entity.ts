import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

export type PetHealthStatus = "healthy" | "attention" | "checkup";
export type PetVaccinationStatus = "up_to_date" | "pending" | "overdue";

@Entity({ name: "pets" })
export class PetEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 80 })
  species!: string;

  @Column({ length: 120 })
  breed!: string;

  @Column({ name: "age_years", type: "int", unsigned: true })
  ageYears!: number;

  @Column({
    name: "health_status",
    type: "enum",
    enum: ["healthy", "attention", "checkup"],
    default: "healthy"
  })
  healthStatus!: PetHealthStatus;

  @Column({
    name: "vaccination_status",
    type: "enum",
    enum: ["up_to_date", "pending", "overdue"],
    default: "up_to_date"
  })
  vaccinationStatus!: PetVaccinationStatus;

  @Column({ name: "photo_url", length: 255, default: "" })
  photoUrl!: string;

  @Column({ type: "text", default: "" })
  notes!: string;

  @Column({ name: "next_care_at", type: "datetime", nullable: true })
  nextCareAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
