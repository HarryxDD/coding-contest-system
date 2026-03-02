import { PartialType } from '@nestjs/swagger';
import { CreateSubmissionDto } from './create-submission.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusEnum } from '../infrastructure/entities/submission.entity';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
    @IsOptional()
    @IsEnum(StatusEnum)
    status?: StatusEnum;
}