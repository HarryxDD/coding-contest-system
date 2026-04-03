import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePatDto {
  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
