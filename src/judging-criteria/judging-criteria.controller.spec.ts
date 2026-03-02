import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { RoleEnum } from '../roles/roles.enum';

describe('JudgingCriteriaController (e2e)', () => {
  let app: INestApplication;
  let organizerToken: string;
  let judgeToken: string;
  let contestId: string;
  let criteriaId: string;

  const randomSuffix = Math.floor(Math.random() * 100000);
  const organizerUser = {
    username: `organizer${randomSuffix}`,
    email: `organizer${randomSuffix}@example.com`,
    password: 'securepassword',
    role: RoleEnum.ORGANIZER,
  };

  const judgeUser = {
    username: `judge${randomSuffix}`,
    email: `judge${randomSuffix}@example.com`,
    password: 'securepassword',
    role: RoleEnum.JUDGE,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Register and login organizer
    await request(app.getHttpServer()).post('/auth/register').send(organizerUser);
    const organizerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: organizerUser.email, password: organizerUser.password });
    organizerToken = organizerLoginRes.body.access_token;

    // Register and login judge
    await request(app.getHttpServer()).post('/auth/register').send(judgeUser);
    const judgeLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: judgeUser.email, password: judgeUser.password });
    judgeToken = judgeLoginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /judging-criteria', () => {
    it('should reject requests without a JWT token', () => {
      return request(app.getHttpServer())
        .post('/judging-criteria')
        .send({
          contestId: 'test-contest-id',
          name: 'Code Quality',
          description: 'Evaluates code quality',
          maxScore: 50,
        })
        .expect(401);
    });

    it('should block judges from creating judging criteria (Role Guard)', () => {
      return request(app.getHttpServer())
        .post('/judging-criteria')
        .set('Authorization', `Bearer ${judgeToken}`)
        .send({
          contestId: 'test-contest-id',
          name: 'Code Quality',
          description: 'Evaluates code quality',
          maxScore: 50,
        })
        .expect(403);
    });

    it('should allow organizers to create judging criteria', async () => {
      const response = await request(app.getHttpServer())
        .post('/judging-criteria')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          contestId: 'test-contest-id-12345',
          name: 'Code Quality',
          description: 'Evaluates code quality',
          maxScore: 50,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Code Quality');
      expect(response.body.maxScore).toBe(50);
      criteriaId = response.body.id;
    });

    it('should reject invalid input (missing required fields)', () => {
      return request(app.getHttpServer())
        .post('/judging-criteria')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          name: 'Code Quality',
          // missing contestId and maxScore
        })
        .expect(400);
    });

    it('should reject invalid maxScore (exceeds max value)', () => {
      return request(app.getHttpServer())
        .post('/judging-criteria')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          contestId: 'test-contest-id',
          name: 'Code Quality',
          maxScore: 2000, // exceeds max of 1000
        })
        .expect(400);
    });
  });

  describe('GET /judging-criteria', () => {
    it('should reject requests without a JWT token', () => {
      return request(app.getHttpServer())
        .get('/judging-criteria')
        .expect(401);
    });

    it('should allow judges to retrieve judging criteria', async () => {
      const response = await request(app.getHttpServer())
        .get('/judging-criteria')
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should support filtering by contestId', async () => {
      const response = await request(app.getHttpServer())
        .get('/judging-criteria?contestId=test-contest-id-12345')
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should support pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/judging-criteria?page=1&limit=10')
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('GET /judging-criteria/:id', () => {
    it('should return 404 for non-existent criteria', () => {
      return request(app.getHttpServer())
        .get('/judging-criteria/invalid-id')
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(404);
    });

    it('should return judging criteria by ID', async () => {
      if (!criteriaId) {
        // Create a criteria if we don't have one
        const createRes = await request(app.getHttpServer())
          .post('/judging-criteria')
          .set('Authorization', `Bearer ${organizerToken}`)
          .send({
            contestId: 'test-contest-id',
            name: 'Design Quality',
            description: 'Evaluates design quality',
            maxScore: 30,
          });
        criteriaId = createRes.body.id;
      }

      const response = await request(app.getHttpServer())
        .get(`/judging-criteria/${criteriaId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(response.body.id).toBe(criteriaId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('maxScore');
    });
  });

  describe('PATCH /judging-criteria/:id', () => {
    it('should reject requests without a JWT token', () => {
      return request(app.getHttpServer())
        .patch(`/judging-criteria/${criteriaId}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should block judges from updating judging criteria', () => {
      return request(app.getHttpServer())
        .patch(`/judging-criteria/${criteriaId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);
    });

    it('should allow organizers to update judging criteria', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/judging-criteria/${criteriaId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          name: 'Updated Code Quality',
          maxScore: 60,
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Code Quality');
      expect(response.body.maxScore).toBe(60);
    });

    it('should return 404 for non-existent criteria', () => {
      return request(app.getHttpServer())
        .patch('/judging-criteria/invalid-id')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('DELETE /judging-criteria/:id', () => {
    let deleteTestCriteriaId: string;

    beforeEach(async () => {
      // Create a criteria to delete
      const createRes = await request(app.getHttpServer())
        .post('/judging-criteria')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          contestId: 'test-contest-id',
          name: 'Delete Test Criteria',
          maxScore: 25,
        });
      deleteTestCriteriaId = createRes.body.id;
    });

    it('should reject requests without a JWT token', () => {
      return request(app.getHttpServer())
        .delete(`/judging-criteria/${deleteTestCriteriaId}`)
        .expect(401);
    });

    it('should block judges from deleting judging criteria', () => {
      return request(app.getHttpServer())
        .delete(`/judging-criteria/${deleteTestCriteriaId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(403);
    });

    it('should allow organizers to delete judging criteria', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/judging-criteria/${deleteTestCriteriaId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when deleting non-existent criteria', () => {
      return request(app.getHttpServer())
        .delete('/judging-criteria/invalid-id')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(404);
    });
  });

  describe('GET /judging-criteria/contest/:contestId', () => {
    it('should return all criteria for a contest', async () => {
      const response = await request(app.getHttpServer())
        .get('/judging-criteria/contest/test-contest-id-12345')
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
});
