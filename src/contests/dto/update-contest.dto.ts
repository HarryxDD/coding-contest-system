import { PartialType } from '@nestjs/swagger';
import { CreateContestDto } from './create-contest.dto';

export class UpdateContestDto extends PartialType(CreateContestDto) { }