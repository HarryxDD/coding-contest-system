import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionEntity } from './entities/submission.entity';
import { submissionRepository } from './submission.repository';
import { SubmissionsRelationalRepository } from './repositories/submission.repository';

@Module({
    imports: [TypeOrmModule.forFeature([SubmissionEntity])],
    providers: [
        {
            provide: submissionRepository,
            useClass: SubmissionsRelationalRepository,
        },
    ],
    exports: [submissionRepository],
})
export class InfrastructureModule { }
