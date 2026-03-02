import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { RoleEnum } from '@/roles/roles.enum';

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    username: string;
    
    @ApiProperty()
    @IsEmail()
    email: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
    
    @ApiProperty({ enum: RoleEnum })
    @IsEnum(RoleEnum)
    role: RoleEnum;
}