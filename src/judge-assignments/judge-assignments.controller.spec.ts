import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { RoleEnum } from '../roles/roles.enum';

describe('JudgeAssignmentsController (e2e)', () => {
  let app: INestApplication;
  let organizerToken: string;
  let judgeToken: string;
  let secondJudgeToken: string;
  let judgeId: string;
  let secondJudgeId: string;
  let assignmentId: string;
  let contestId: string;

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

  const secondJudgeUser = {
    username: `judge2${randomSuffix}`,
    email: `judge2${randomSuffix}@example.com`,
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

    // Register and login first judge
    const judgeRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(judgeUser);
    judgeId = judgeRegisterRes.body.id;

    const judgeLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: judgeUser.email, password: judgeUser.password });
    judgeToken = judgeLoginRes.body.access_token;

    // Register and login second judge
    const secondJudgeRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(secondJudgeUser);
    secondJudgeId = secondJudgeRegisterRes.body.id;

    const secondJudgeLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: secondJudgeUser.email, password: secondJudgeUser.password });
    secondJudgeToken = secondJudgeLoginRes.body.access_token;

    // Generate test contest ID
    contestId = `contest-${randomSuffix}`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /judge-assignments', () => {
    it('should reject requests without a JWT token', () => {
      return request(app.getHttpServer())
        .post('/judge-assignments')
        .send({
          contestId: contestId,
          judgeId: judgeId,
        })
        .expect(401);
    });

    it('should block judges from creating assignments (Role Guard)', () => {
      return request(app.getHttpServer())
        .post('/judge-assignments')
        .set('Authorization', `Bearer ${judgeToken}`)
        .send({
          contestId: contestId,
          judgeId: judgeId,
        })
        .expect(403);
    });

    it('should allow organizers to assign judges to contests', async () => {
      const response = await request(app.getHttpServer())
        .post('/judge-assignments')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          contestId: contestId,
          judgeId: judgeId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.contestId).toBe(contestId);
      expect(response.body.judgeId).toBe(judgeId);
      assignmentId = response.body.id;
    });

    it('should reject duplicate judge assignments (409 Conflict)', () => {
      return request(app.getHttpServer())
        .post('/judge-assignments')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          contestId: contestId,
          judgeId: judgeId,
        })
        .expect(409);
    });

    it('should reject invalid input (missing required fields)', () => {
      return request(app.getHttpServer())
        .post('/judge-assignments')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          contestId: contestId,
          // missing judgeId
        })
        .expect(400);
    });

    it('should reject invalid UUID format for judgeId', () => {
      return request(app.getHttpServer())
        .post('/judge-assignments')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          contestId: contestId,
          judgeId: 'not-a-valid-uuid',
        })
        .expect(400);
    });
  });

  describe('GET /judge-assignments', () => {
    it('should reject requests without a JWT token', () => {
      return request(app.getHttpServer())
        .get('/judge-assignments')
        .expect(401);
    });

    it('should allow judges to retrieve assignments', async () => {
      const response = await request(app.getHttpServer())
        .get('/judge-assignments')
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should support filtering by contestId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/judge-assignments?contestId=${contestId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should support filtering by judgeId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/judge-assignments?judgeId=${judgeId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should support pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/judge-assignments?page=1&limit=10')
        .set('Authorization', `Bear ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('GET /judge-assignments/:id', () => {
    it('should return 404 for non-existent assignment', () => {
      return request(app.getHttpServer())
        .get('/judge-assignments/invalid-id')
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(404);
    });

    it('should return judge assignment by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/judge-assignments/${assignmentId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(response.body.id).toBe(assignmentId);
      expect(response.body.contestId).toBe(contestId);
      expect(response.body.judgeId).toBe(judgeId);
    });
  });

  describe('DELETE /judge-assignments/:id', () => {
    let deleteTestAssignmentId: string;

    beforeEach(async () => {
      // Create an assignment to delete
      const createRes = await request(app.getHttpServer())
        .post('/judge-assignments')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          contestId: `delete-test-${randomSuffix}`,
          judgeId: secondJudgeId,
        });
      deleteTestAssignmentId = createRes.body.id;
    });

    it('should reject requests without a JWT token', () => {
      return request(app.getHttpServer())
        .delete(`/judge-assignments/${deleteTestAssignmentId}`)
        .expect(401);
    });

    it('should block judges from deleting assignments', () => {
      return request(app.getHttpServer())
        .delete(`/judge-assignments/${deleteTestAssignmentId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(403);
    });

    it('should allow organizers to delete assignments', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/judge-assignments/${deleteTestAssignmentId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when deleting non-existent assignment', () => {
      return request(app.getHttpServer())
        .delete('/judge-assignments/invalid-id')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(404);
    });
  });

  describe('GET /judge-assignments/contest/:contestId', () => {
    it('should return all judges assigned to a contest', async () => {
      const response = await request(app.getHttpServer())
        .get(`/judge-assignments/contest/${contestId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should return empty array for contests with no assigned judges', async () => {
      const response = await request(app.getHttpServer())
        .get(`/judge-assignments/contest/non-existent-contest`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /judge-assignments/judge/:judgeId', () => {
    it('should return all contests a judge is assigned to', async () => {
      const response = await request(app.getHttpServer())
        .get(`/judge-assignments/judge/${judgeId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should return empty array for judges with no assigned contests', async () => {
      const response = await request(app.getHttpServer())
        .get(`/judge-assignments/judge/non-existent-judge`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });
  });
});
