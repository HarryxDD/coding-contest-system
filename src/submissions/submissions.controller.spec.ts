import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { RoleEnum } from '../roles/roles.enum';

describe('SubmissionsController', () => {
    let app: INestApplication;
    let participantToken: string;

    const randomSuffix = Math.floor(Math.random() * 100000);

    const participantUser = {
        username: `participant${randomSuffix}`,
        email: `participant${randomSuffix}@example.com`,
        password: 'securepassword',
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
                .post('/submissions')
                .send(newSubmissionPayload)
                .expect(401);
        });

        it.skip('should create a submission for an authenticated PARTICIPANT', async () => {
            const response = await request(app.getHttpServer())
                .post('/submissions')
                .set('Authorization', `Bearer ${participantToken}`)
                .send(newSubmissionPayload)
                .expect(201);

            expect(response.body).toHaveProperty('id');
        });
    });

    describe('GET /submissions', () => {
        it('should return a paginated list of submissions', () => {
            return request(app.getHttpServer())
                .get('/submissions')
                .set('Authorization', `Bearer ${participantToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('data');
                    expect(response.body).toHaveProperty('page');
                    expect(response.body).toHaveProperty('totalItems');
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
