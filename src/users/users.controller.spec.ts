import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { RoleEnum } from '../roles/roles.enum';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    let regularUserToken: string;

    const randomSuffix = Math.floor(Math.random() * 100000);
    const adminUser = {
        username: `admin${randomSuffix}`,
        email: `admin${randomSuffix}@example.com`,
        password: 'securepassword',
        role: RoleEnum.ADMIN,
    };

    const regularUser = {
        username: `user${randomSuffix}`,
        email: `user${randomSuffix}@example.com`,
        password: 'securepassword',
        role: RoleEnum.PARTICIPANT,
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        await request(app.getHttpServer()).post('/auth/register').send(adminUser);

        const adminLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: adminUser.email, password: adminUser.password });

        adminToken = adminLoginRes.body.token;

        await request(app.getHttpServer()).post('/auth/register').send(regularUser);
        const regularLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: regularUser.email, password: regularUser.password });

        regularUserToken = regularLoginRes.body.token;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /users', () => {
        it('should reject requests without a JWT token', () => {
            return request(app.getHttpServer())
                .get('/users')
                .expect(401);
        });

        it('should block regular users from viewing all users (Role Guard)', () => {
            return request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(403);
        });

        it.skip('should return a paginated envelope for ADMIN', () => {
            return request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('data');
                    expect(response.body).toHaveProperty('hasNextPage');
                    expect(Array.isArray(response.body.data)).toBeTruthy();
                });
        });
    });

    describe('GET /users/:id', () => {
        it('should allow any authenticated user to view a specific profile', async () => {
            const userProfileRes = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: regularUser.email, password: regularUser.password });

            const userId = userProfileRes.body.user.id;
            return request(app.getHttpServer())
                .get(`/users/${userId}`)
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.email).toEqual(regularUser.email);
                });
        });
    });
});
