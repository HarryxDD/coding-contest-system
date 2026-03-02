import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContestEntity } from "./entities/contest.entity";
import { contestRepository } from "./contest.repository";
import { ContestsRelationalRepository } from "./repositories/contest.repository";

@Module({
    imports: [TypeOrmModule.forFeature([ContestEntity])],
    providers: [
        {
            provide: contestRepository,
            useClass: ContestsRelationalRepository
        }
    ],
    exports: [contestRepository],
})

export class InfrastructureModule { }