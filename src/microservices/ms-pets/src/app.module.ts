import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { toBoolean } from "./common/env";
import { PetEntity } from "./pets/pet.entity";
import { PetsModule } from "./pets/pets.module";

type SupportedDbType = "mysql" | "postgres";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = (configService.get<string>("DB_TYPE") ?? "mysql") as SupportedDbType;
        const sslEnabled = toBoolean(configService.get<string>("DB_SSL"), false);
        const ssl = sslEnabled ? { rejectUnauthorized: false } : false;
        const databaseUrl = configService.get<string>("DATABASE_URL");

        if (databaseUrl) {
          return {
            type: dbType,
            url: databaseUrl,
            schema: dbType === "postgres" ? configService.get<string>("DB_SCHEMA") ?? "pets" : undefined,
            ssl,
            entities: [PetEntity],
            synchronize: false
          };
        }

        return {
          type: dbType,
          host: configService.getOrThrow<string>("DB_HOST"),
          port: Number(configService.getOrThrow<string>("DB_PORT")),
          username: configService.getOrThrow<string>("DB_USER"),
          password: configService.getOrThrow<string>("DB_PASSWORD"),
          database: configService.getOrThrow<string>("DB_NAME"),
          schema: dbType === "postgres" ? configService.get<string>("DB_SCHEMA") ?? "pets" : undefined,
          ssl,
          entities: [PetEntity],
          synchronize: false
        };
      }
    }),
    PetsModule
  ]
})
export class AppModule {}
