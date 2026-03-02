import { RoleEnum } from "@/roles/roles.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

export class User {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String, example: 'harry' })
    username: string

    @ApiProperty({ type: String, example: 'harry@gmail.com' })
    @Expose({ groups: ['me', 'admin'] })
    email: string | null

    @Exclude({ toPlainOnly: true }) // Never send passwordHash
    passwordHash?: string

    @ApiProperty({ type: String, nullable: true })
    profilePic?: string | null;

    @ApiProperty({ enum: RoleEnum })
    role?: RoleEnum | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}