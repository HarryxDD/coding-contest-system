import { User } from "@/users/domain/user";
import { UserEntity } from "../entities/user.entity";

export class UserMapper {
    static toDomain(raw: UserEntity): User {
        const domainEntity = new User();
        domainEntity.id = raw.id;
        domainEntity.username = raw.username;
        domainEntity.email = raw.email;
        domainEntity.passwordHash = raw.passwordHash;
        domainEntity.profilePic = raw.profilePic;
        domainEntity.role = raw.role;
        domainEntity.createdAt = raw.createdAt;
        domainEntity.updatedAt = raw.updatedAt;
        return domainEntity;
    }

    static toPersistence(domainUser: User): UserEntity {
        const persistenceEntity = new UserEntity();
        if (domainUser.id) {
            persistenceEntity.id = domainUser.id;
        }
        persistenceEntity.username = domainUser.username;
        persistenceEntity.email = domainUser.email as string;
        persistenceEntity.passwordHash = domainUser.passwordHash as string;
        persistenceEntity.role = domainUser.role as any;
        persistenceEntity.profilePic = domainUser.profilePic ?? null;
        persistenceEntity.createdAt = domainUser.createdAt;
        persistenceEntity.updatedAt = domainUser.updatedAt;
        return persistenceEntity;
    }
}