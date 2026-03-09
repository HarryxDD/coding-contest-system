import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { RoleEnum } from '../roles/roles.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { Repository } from 'typeorm';

describe('ContestsController', () => {
    let app: INestApplication;
    let userRepository: Repository<UserEntity>;

    let organizerToken: string;
    let participantToken: string;
    let createdContestId: string;
    const randomSuffix = Math.floor(Math.random() * 100000);

    const extractToken = (body: any): string =>
        body?.token ?? body?.accessToken ?? body?.access_token ?? '';

    const organizerUser = {
        username: `organizer${randomSuffix}`,
        email: `organizer${randomSuffix}@example.com`,
        password: 'securepassword',
    };
    const participantUser = {
        username: `participant${randomSuffix}`,
        email: `participant${randomSuffix}@example.com`,
        password: 'securepassword',
    };

    const newContestPayload = {
        name: 'Spring Oulu Hackathon 2026',
        description: 'A test contest',
        reward: '$10,000',
        maxTeamSize: 4,
        startDate: '2026-03-10T00:00:00.000Z',
        endDate: '2026-03-20T00:00:00.000Z',
        submissionDeadline: '2026-03-18T00:00:00.000Z'
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

        await app.init();

        // Get user repository for role management
        userRepository = moduleFixture.get<Repository<UserEntity>>(
            getRepositoryToken(UserEntity),
        );

        // Register organizer
        const organizerRegisterRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send(organizerUser)
            .expect(201);
        const organizerId = organizerRegisterRes.body.user.id;
        
        // Update organizer role
        await userRepository.update(organizerId, { role: RoleEnum.ORGANIZER });

        // Register participant
        const partRegisterRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send(participantUser)
            .expect(201);
        // Participant defaults to PARTICIPANT role, so no need to update

        const orgLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: organizerUser.email, password: organizerUser.password })
            .expect(200);
        organizerToken = extractToken(orgLoginRes.body);
        expect(organizerToken).toBeTruthy();

        const partLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: participantUser.email, password: participantUser.password })
            .expect(200);
        participantToken = extractToken(partLoginRes.body);
        expect(participantToken).toBeTruthy();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /contests', () => {
        it('should reject unauthenticated users (No JWT)', () => {
            return request(app.getHttpServer())
                .post('/contests')
                .send(newContestPayload)
                .expect(401);
        });

        it.skip('should create a contest if the user is an ORGANIZER', async () => {
            const response = await request(app.getHttpServer())
                .post('/contests')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send(newContestPayload)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toEqual(newContestPayload.name);

            createdContestId = response.body.id;
        });

        it('should reject normal participants from creating contests', () => {
            return request(app.getHttpServer())
                .post('/contests')
                .set('Authorization', `Bearer ${participantToken}`)
                .send(newContestPayload)
                .expect(403);
        });
    });

    describe('GET /contests', () => {
        it('should return a paginated list of contests for ANY authenticated user', () => {
            return request(app.getHttpServer())
                .get('/contests')
                .set('Authorization', `Bearer ${participantToken}`)
                .expect(200) // 200 OK
                .then((response) => {
                    // This proves our InfinityPagination Envelope works!
                    expect(response.body).toHaveProperty('data');
                    expect(response.body).toHaveProperty('page');
                    expect(response.body).toHaveProperty('totalItems');
                    expect(Array.isArray(response.body.data)).toBeTruthy();
                });
        });
    });
});