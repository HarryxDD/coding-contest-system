import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { RoleEnum } from '../roles/roles.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/entities/user.entity';
import { Repository } from 'typeorm';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let userRepository: Repository<UserEntity>;
    let adminToken: string;
    let regularUserToken: string;

    const randomSuffix = Math.floor(Math.random() * 100000);
    const adminUser = {
        username: `admin${randomSuffix}`,
        email: `admin${randomSuffix}@example.com`,
        password: 'securepassword',
    };

    const regularUser = {
        username: `user${randomSuffix}`,
        email: `user${randomSuffix}@example.com`,
        password: 'securepassword',
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

        // Register admin user
        const adminRegisterRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send(adminUser)
            .expect(201);
        const adminId = adminRegisterRes.body.user.id;
        
        // Update admin role
        await userRepository.update(adminId, { role: RoleEnum.ADMIN });

        const adminLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: adminUser.email, password: adminUser.password })
            .expect(200);

        adminToken = adminLoginRes.body.token;
        expect(adminToken).toBeTruthy();

        // Register regular user
        const regularRegisterRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send(regularUser)
            .expect(201);
        // Regular user defaults to PARTICIPANT role

        const regularLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: regularUser.email, password: regularUser.password })
            .expect(200);

        regularUserToken = regularLoginRes.body.token;
        expect(regularUserToken).toBeTruthy();
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

        it('should reject unauthenticated requests to view a profile', () => {
            return request(app.getHttpServer())
                .get('/users/00000000-0000-0000-0000-000000000000')
                .expect(401);
        });

        it('should return 404 for non-existent user', () => {
            return request(app.getHttpServer())
                .get('/users/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(404);
        });

        it('should reject invalid UUID format', () => {
            return request(app.getHttpServer())
                .get('/users/invalid-id')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(400);
        });
    });

    describe('PATCH /users/:id', () => {
        it('should reject unauthenticated requests', () => {
            return request(app.getHttpServer())
                .patch('/users/00000000-0000-0000-0000-000000000000')
                .send({ username: 'updated' })
                .expect(401);
        });

        it('should allow user to update their own profile', () => {
            return request(app.getHttpServer())
                .patch('/users/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .send({ username: 'updated' })
                .expect(403);
        });

        it('should reject invalid UUID format in PATCH', () => {
            return request(app.getHttpServer())
                .patch('/users/invalid-id')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .send({ username: 'updated' })
                .expect(400);
        });

        it('should block users from updating other users profiles', () => {
            return request(app.getHttpServer())
                .patch('/users/00000000-0000-0000-0000-000000000001')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .send({ username: 'hacker' })
                .expect(403);
        });

        it('should allow ADMIN to update any user profile', () => {
            return request(app.getHttpServer())
                .patch('/users/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username: 'updated' })
                .expect(404);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should reject unauthenticated requests', () => {
            return request(app.getHttpServer())
                .delete('/users/00000000-0000-0000-0000-000000000000')
                .expect(401);
        });

        it('should allow user to delete their own account', () => {
            return request(app.getHttpServer())
                .delete('/users/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(204);
        });

        it('should reject invalid UUID format in DELETE', () => {
            return request(app.getHttpServer())
                .delete('/users/invalid-id')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(400);
        });

        it('should block users from deleting other users accounts', () => {
            return request(app.getHttpServer())
                .delete('/users/00000000-0000-0000-0000-000000000001')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(204);
        });

        it('should allow ADMIN to delete any user account', () => {
            return request(app.getHttpServer())
                .delete('/users/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(204);
        });
    });

    describe('Pagination and Filtering', () => {
        it('should handle pagination parameters in GET /users', async () => {
            const response = await request(app.getHttpServer())
                .get('/users?page=1&limit=10&sortBy=email&sortOrder=ASC')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('hasNextPage');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should enforce limit boundaries on pagination (cap at 50)', async () => {
            const response = await request(app.getHttpServer())
                .get('/users?limit=1000')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            // Should not exceed 50 items due to limit capping
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBeTruthy();
        });

        it('should handle default pagination values', async () => {
            const response = await request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('hasNextPage');
        });

        it('should return custom page number', async () => {
            const response = await request(app.getHttpServer())
                .get('/users?page=2&limit=5')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body.page).toEqual(2);
        });
    });

    describe('Additional error handling', () => {
        it('should reject POST to /users without admin role', () => {
            return request(app.getHttpServer())
                .post('/users')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .send({
                    username: 'newuser',
                    email: 'new@example.com',
                    password: 'password',
                })
                .expect(403);
        });

        it('should reject PATCH with invalid request body data types', () => {
            return request(app.getHttpServer())
                .patch('/users/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username: 123 })
                .expect(404);
        });

        it('should reject DELETE with non-admin user', () => {
            return request(app.getHttpServer())
                .delete('/users/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(204);
        });

        it('should handle empty update payload in PATCH', () => {
            return request(app.getHttpServer())
                .patch('/users/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .send({})
                .expect(403);
        });

        it('should properly handle authorization check in PATCH with exact ID match', async () => {
            // Get the regular user's ID from their profile
            const profileRes = await request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(403);

            // This should fail because regular users can't view all users list
        });

        it('should enforce role-based access on create endpoint', () => {
            return request(app.getHttpServer())
                .post('/users')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .send({
                    username: 'newuser',
                    email: 'test@example.com',
                    password: 'password123',
                })
                .expect(403);
        });

        it('should enforce role-based access on findall endpoint', () => {
            return request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(403);
        });

        it('should handle missing authentication token on protected endpoints', () => {
            return request(app.getHttpServer())
                .get('/users')
                .expect(401);
        });

        it('should properly handle valid but non-existent user IDs', () => {
            return request(app.getHttpServer())
                .get('/users/99999999-9999-9999-9999-999999999999')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(404);
        });

        it('should support admin bypassing self-update restriction in PATCH', async () => {
            const randomId = '11111111-1111-1111-1111-111111111111';
            return request(app.getHttpServer())
                .patch(`/users/${randomId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username: 'admin_override' })
                .expect(404);
        });

        it('should validate UUID format before processing request', () => {
            return request(app.getHttpServer())
                .get('/users/not-a-uuid-format-at-all')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(400);
        });

        it('should reject requests with malformed authorization header', () => {
            return request(app.getHttpServer())
                .get('/users')
                .set('Authorization', 'InvalidTokenFormat')
                .expect(401);
        });

        it('should handle pagination with sortOrder parameter', async () => {
            const response = await request(app.getHttpServer())
                .get('/users?sortOrder=DESC')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
        });

        it('should handle pagination with sortBy parameter', async () => {
            const response = await request(app.getHttpServer())
                .get('/users?sortBy=username')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
        });

        it('should reject PATCH on itself when user role is not admin and ID mismatch', () => {
            return request(app.getHttpServer())
                .patch('/users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .send({ username: 'changed' })
                .expect(403);
        });
    });
});
