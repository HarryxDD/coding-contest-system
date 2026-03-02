import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

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
}