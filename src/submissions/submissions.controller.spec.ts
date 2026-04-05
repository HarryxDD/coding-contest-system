import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../src/users/infrastructure/entities/user.entity';
import { Repository } from 'typeorm';
import { RoleEnum } from '../../src/roles/roles.enum';

describe('SubmissionsController', () => {
    let app: INestApplication;
    let participantToken: string;
    let validContestId: string;
    let userRepository: Repository<UserEntity>;

    const randomSuffix = Math.floor(Math.random() * 100000);

    const participantUser = {
        username: `submspec_user_${randomSuffix}`,
        email: `submspec_user_${randomSuffix}@test.com`,
        password: 'testpassword123',
    };

    const newSubmissionPayload = {
        teamId: '00000000-0000-0000-0000-000000000000', // Mock UUIDs
        contestId: '00000000-0000-0000-0000-000000000000',
        title: 'Delivery 3 Deadline',
        repositoryUrl: 'https://github.com/teamname/project',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        userRepository = moduleFixture.get<Repository<UserEntity>>(
            getRepositoryToken(UserEntity)
        );

        const organizer = {
            username: `submspec_admin_${randomSuffix}`,
            email: `submspec_admin_${randomSuffix}@example.com`,
            password: 'password123',
        };

        const orgRegRes = await request(app.getHttpServer()).post('/auth/register').send(organizer);
        await userRepository.update(orgRegRes.body.user.id, { role: RoleEnum.ADMIN });

        const adminRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: organizer.email, password: organizer.password });
        const adminToken = adminRes.body.token || adminRes.body.access_token || adminRes.body.accessToken;

        const contestPayload = {
            name: `Subms Spec Contest ${randomSuffix}`,
            startDate: '2027-01-01T00:00:00.000Z',
            endDate: '2027-12-31T00:00:00.000Z',
            submissionDeadline: '2027-11-30T00:00:00.000Z',
        };
        const contestRes = await request(app.getHttpServer()).post('/contests').set('Authorization', `Bearer ${adminToken}`).send(contestPayload);
        validContestId = contestRes.body.id;
        newSubmissionPayload.contestId = validContestId;

        await request(app.getHttpServer()).post('/auth/register').send(participantUser);
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: participantUser.email, password: participantUser.password })
            .expect(200);

        participantToken = loginRes.body.token;
        expect(participantToken).toBeTruthy();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /submissions', () => {
        it('should reject unauthenticated users', () => {
            return request(app.getHttpServer())
                .post(`/contests/${newSubmissionPayload.contestId}/submissions`)
                .send(newSubmissionPayload)
                .expect(401);
        });

        it.skip('should create a submission for an authenticated PARTICIPANT', async () => {
            const response = await request(app.getHttpServer())
                .post(`/contests/${newSubmissionPayload.contestId}/submissions`)
                .set('Authorization', `Bearer ${participantToken}`)
                .send(newSubmissionPayload)
                .expect(201);

            expect(response.body).toHaveProperty('id');
        });
    });

    describe('GET /submissions', () => {
        it('should return a paginated list of submissions', () => {
            return request(app.getHttpServer())
                .get(`/contests/${newSubmissionPayload.contestId}/submissions`)
                .set('Authorization', `Bearer ${participantToken}`)
                .then(r => {
                    if (r.status !== 200) console.error("DEBUG_SUBS:", r.body, " CONTEST_ID:", newSubmissionPayload.contestId);
                    expect(r.status).toBe(200);
                    expect(r.body).toHaveProperty('data');
                    expect(r.body).toHaveProperty('page');
                    expect(r.body).toHaveProperty('totalItems');
                });
        });

        it('should handle pagination with custom parameters', () => {
            return request(app.getHttpServer())
                .get('/submissions?page=1&limit=5')
                .set('Authorization', `Bearer ${participantToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('data');
                    expect(Array.isArray(response.body.data)).toBeTruthy();
                });
        });

        it('should reject unauthenticated requests', () => {
            return request(app.getHttpServer())
                .get('/submissions')
                .expect(401);
        });
    });

    describe('GET /submissions/:id', () => {
        it('should get a submission by id', () => {
            return request(app.getHttpServer())
                .get('/submissions/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${participantToken}`)
                .expect(200, (res) => {
                    // Should either return submission or 404
                });
        });

        it('should reject invalid UUID format', () => {
            return request(app.getHttpServer())
                .get('/submissions/invalid-id')
                .set('Authorization', `Bearer ${participantToken}`)
                .expect(400);
        });

        it('should reject unauthenticated requests', () => {
            return request(app.getHttpServer())
                .get('/submissions/00000000-0000-0000-0000-000000000000')
                .expect(401);
        });
    });

    describe('PATCH /submissions/:id', () => {
        it('should reject unauthenticated users', () => {
            return request(app.getHttpServer())
                .patch('/submissions/00000000-0000-0000-0000-000000000000')
                .send({ status: 'SUBMITTED' })
                .expect(401);
        });

        it('should allow authenticated user to update submission', () => {
            return request(app.getHttpServer())
                .patch('/submissions/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${participantToken}`)
                .send({ status: 'SUBMITTED' })
                .expect(200, (res) => {
                    // Should return updated submission or 404
                });
        });

        it('should reject invalid UUID format', () => {
            return request(app.getHttpServer())
                .patch('/submissions/invalid-id')
                .set('Authorization', `Bearer ${participantToken}`)
                .send({ status: 'SUBMITTED' })
                .expect(400);
        });
    });

    describe('DELETE /submissions/:id', () => {
        it('should reject unauthenticated users', () => {
            return request(app.getHttpServer())
                .delete('/submissions/00000000-0000-0000-0000-000000000000')
                .expect(401);
        });

        it('should allow authenticated user to delete submission', () => {
            return request(app.getHttpServer())
                .delete('/submissions/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${participantToken}`)
                .expect(204, (res) => {
                    // Should return 204 on success or 404
                });
        });

        it('should reject invalid UUID format', () => {
            return request(app.getHttpServer())
                .delete('/submissions/invalid-id')
                .set('Authorization', `Bearer ${participantToken}`)
                .expect(400);
        });
    });
});
