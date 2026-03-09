import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsEnum } from "class-validator";
import { RoleEnum } from "@/roles/roles.enum";

export class AuthRegisterDto {
    @ApiProperty({ example: 'harry_truong' })
    @IsNotEmpty()
    username: string

    @ApiProperty({ example: 'test@example.com' })
    @IsEmail()
    email: string

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    password: string

    @ApiProperty({ enum: RoleEnum, required: false })
    @IsOptional()
    @IsEnum(RoleEnum)
    role?: RoleEnum
}