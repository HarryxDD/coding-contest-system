import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { userRepository } from "./user.repository";
import { UsersRelationalRepository } from "./repositories/user.repository";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [
        {
            provide: userRepository,
            useClass: UsersRelationalRepository
        },
    ],
    exports: [userRepository]
})
export class InfrastructureModule { }