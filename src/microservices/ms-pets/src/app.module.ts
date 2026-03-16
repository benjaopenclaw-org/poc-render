import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RekodiNestAuthModule } from "@rekodi/nest-auth";
import { toBoolean } from "./common/env";
import { PetEntity } from "./pets/pet.entity";
import { PetsModule } from "./pets/pets.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"]
    }),
    RekodiNestAuthModule.forRoot({
      userIdClaimKeys: ["user_id", "sub"]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql" as const,
        host: configService.getOrThrow<string>("DB_HOST"),
        port: Number(configService.getOrThrow<string>("DB_PORT")),
        username: configService.getOrThrow<string>("DB_USER"),
        password: configService.getOrThrow<string>("DB_PASSWORD"),
        database: configService.getOrThrow<string>("DB_NAME"),
        ssl: toBoolean(configService.get<string>("DB_SSL"), false) ? {} : false,
        entities: [PetEntity],
        synchronize: false
      })
    }),
    PetsModule
  ]
})
export class AppModule {}
