import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, Repository } from "typeorm";
import { CreatePetDto } from "./dto/create-pet.dto";
import { UpdatePetDto } from "./dto/update-pet.dto";
import { PetEntity } from "./pet.entity";

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(PetEntity)
    private readonly petsRepository: Repository<PetEntity>
  ) {}

  async findAll(): Promise<PetEntity[]> {
    return this.petsRepository.find({
      order: {
        updatedAt: "DESC"
      }
    });
  }

  async create(createPetDto: CreatePetDto): Promise<PetEntity> {
    const pet = this.petsRepository.create({
      ...createPetDto,
      photoUrl: createPetDto.photoUrl ?? "",
      notes: createPetDto.notes ?? "",
      nextCareAt: createPetDto.nextCareAt ? new Date(createPetDto.nextCareAt) : null
    });

    return this.petsRepository.save(pet);
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<PetEntity> {
    const pet = await this.petsRepository.findOne({ where: { id } });

    if (!pet) {
      throw new NotFoundException(`Pet with id ${id} was not found.`);
    }

    const nextCareAt =
      updatePetDto.nextCareAt === undefined
        ? pet.nextCareAt
        : updatePetDto.nextCareAt
          ? new Date(updatePetDto.nextCareAt)
          : null;

    Object.assign(pet, {
      ...updatePetDto,
      nextCareAt
    });

    return this.petsRepository.save(pet);
  }

  async remove(id: string): Promise<void> {
    const result = await this.petsRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Pet with id ${id} was not found.`);
    }
  }

  async getSummary() {
    const pets = await this.findAll();
    const totalPets = pets.length;
    const vaccinatedPets = pets.filter((pet) => pet.vaccinationStatus === "up_to_date").length;
    const petsNeedingAttention = pets.filter(
      (pet) => pet.healthStatus !== "healthy" || pet.vaccinationStatus !== "up_to_date"
    ).length;

    const speciesMap = new Map<
      string,
      {
        species: string;
        total: number;
        healthy: number;
        attention: number;
      }
    >();

    for (const pet of pets) {
      const current = speciesMap.get(pet.species) ?? {
        species: pet.species,
        total: 0,
        healthy: 0,
        attention: 0
      };

      current.total += 1;
      current.healthy += pet.healthStatus === "healthy" ? 1 : 0;
      current.attention += pet.healthStatus !== "healthy" || pet.vaccinationStatus !== "up_to_date" ? 1 : 0;
      speciesMap.set(pet.species, current);
    }

    return {
      totalPets,
      vaccinatedPets,
      petsNeedingAttention,
      speciesBreakdown: [...speciesMap.values()].sort((left, right) => right.total - left.total)
    };
  }

  async getReminders() {
    const upcomingPets = await this.petsRepository.find({
      where: {
        nextCareAt: LessThanOrEqual(new Date(Date.now() + 1000 * 60 * 60 * 24 * 45))
      },
      order: {
        nextCareAt: "ASC"
      }
    });

    return upcomingPets.map((pet) => ({
      id: `${pet.id}:${pet.nextCareAt?.toISOString() ?? "none"}`,
      petId: pet.id,
      petName: pet.name,
      species: pet.species,
      nextCareAt: pet.nextCareAt?.toISOString() ?? new Date().toISOString(),
      message:
        pet.vaccinationStatus === "overdue"
          ? "Regularizar vacuna vencida"
          : pet.healthStatus === "attention"
            ? "Control veterinario recomendado"
            : "Seguimiento preventivo del hogar"
    }));
  }
}
