import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { RoleEnum } from '../roles/roles.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { Repository } from 'typeorm';

/**
 * JudgingCriteriaController E2E Test Checklist
 *
 * POST /judging-criteria - Create judging criteria
 * Reject unauthenticated requests (401)
 * Block judges from creating criteria (403)
 * Allow organizers to create judging criteria (201)
 * Reject invalid input - missing required fields (400)
 * Reject invalid maxScore (exceeds max value) (400)
 *
 * GET /judging-criteria - List all criteria with pagination/filtering
 * Reject unauthenticated requests (401)
 * Return paginated list for authenticated users (200)
 * Support filtering by contestId (200)
 * Support sorting parameters
 * Support pagination parameters (page, limit)
 *
 * GET /judging-criteria/:id - Get specific criteria
 * Reject unauthenticated requests (401)
 * Return 404 for non-existent criteria
 * Return criteria details by ID (200) [depends on creation]
 *
 * PATCH /judging-criteria/:id - Update criteria
 * Reject unauthenticated requests (401)
 * Block judges from updating criteria (403)
 * Allow organizers to update criteria (200) [depends on creation]
 * Return 404 for non-existent criteria
 *
 * DELETE /judging-criteria/:id - Delete criteria
 * Reject unauthenticated requests (401)
 * Block judges from deleting criteria (403)
 * Allow organizers to delete criteria (200) [depends on creation]
 * Return 404 for non-existent criteria
 *
 * GET /judging-criteria/contest/:contestId - Get criteria for contest
 * Return all criteria for a contest (200)
 * Return empty array for contests with no criteria (200)
 */

describe('JudgingCriteriaController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let organizerToken: string;
  let judgeToken: string;
  let contestId: string;
  let criteriaId: string;

  const randomSuffix = Math.floor(Math.random() * 100000);
  const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

  const extractToken = (body: any): string =>
    body?.token ?? body?.accessToken ?? body?.access_token ?? '';

  const organizerUser = {
    username: `organizer${randomSuffix}`,
    email: `organizer${randomSuffix}@example.com`,
    password: 'securepassword',
  };

  const judgeUser = {
    username: `judge${randomSuffix}`,
    email: `judge${randomSuffix}@example.com`,
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

    // Register organizer
    const organizerRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(organizerUser)
      .expect(201);
    const organizerId = organizerRegisterRes.body.user.id;
    
    // Update organizer role
    await userRepository.update(organizerId, { role: RoleEnum.ORGANIZER });

    // Login organizer
    const organizerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: organizerUser.email, password: organizerUser.password })
      .expect(200);
    organizerToken = extractToken(organizerLoginRes.body);
    expect(organizerToken).toBeTruthy();

    // Register judge
    const judgeRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(judgeUser)
      .expect(201);
    const judgeId = judgeRegisterRes.body.user.id;
    
    // Update judge role
    await userRepository.update(judgeId, { role: RoleEnum.JUDGE });

    // Login judge
    const judgeLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: judgeUser.email, password: judgeUser.password })
      .expect(200);
    judgeToken = extractToken(judgeLoginRes.body);
    expect(judgeToken).toBeTruthy();

    // Create a test contest
    const contestPayload = {
      name: `Test Contest ${randomSuffix}`,
      description: 'Test contest for judging criteria',
      reward: '$5,000',
      maxTeamSize: 5,
      startDate: '2026-03-10T00:00:00.000Z',
      endDate: '2026-03-20T00:00:00.000Z',
      submissionDeadline: '2026-03-18T00:00:00.000Z',
    };

    const contestRes = await request(app.getHttpServer())
      .post('/contests')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send(contestPayload)
      .expect(201);

    contestId = contestRes.body.id;
    expect(contestId).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /judging-criteria', () => {
    it('should reject requests without a JWT token', () => {
      return request(app.getHttpServer())
        .post('/judging-criteria')
        .send({
          contestId: contestId,
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
          contestId: contestId,
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
          contestId: contestId,
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
          contestId: contestId,
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
        .get(`/judging-criteria?contestId=${contestId}`)
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
        .get(`/judging-criteria/${NON_EXISTENT_ID}`)
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
            contestId: contestId,
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
        .patch(`/judging-criteria/${NON_EXISTENT_ID}`)
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
          contestId: contestId,
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
        .delete(`/judging-criteria/${NON_EXISTENT_ID}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(404);
    });
  });

  describe('GET /judging-criteria/contest/:contestId', () => {
    it('should return all criteria for a contest', async () => {
      const response = await request(app.getHttpServer())
        .get(`/judging-criteria/contest/${contestId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
});
