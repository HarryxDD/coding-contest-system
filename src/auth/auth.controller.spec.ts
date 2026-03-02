import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../app.module";
import request from 'supertest';

describe('AuthController', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleFixture.createNestApplication();

        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    const randomSuffix = Math.floor(Math.random() * 10000);
    const testUser = {
        username: `testuser${randomSuffix}`,
        email: `test${randomSuffix}@example.com`,
        password: `password123`,
    }

    it('/auth/register (POST)', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201)
            .then((response) => {
                expect(response.body).toHaveProperty('token');
                expect(response.body).not.toHaveProperty('passwordHash')
            })
    })

    it('/auth/login (POST)', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            })
            .expect(200)
            .then((response) => {
                expect(response.body).toHaveProperty('token');
                expect(response.body).toHaveProperty('user');
            });
    });
})