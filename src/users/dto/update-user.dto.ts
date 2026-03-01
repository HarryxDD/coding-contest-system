import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Makes all fields from CreateUserDto optional
export class UpdateUserDto extends PartialType(CreateUserDto) { }