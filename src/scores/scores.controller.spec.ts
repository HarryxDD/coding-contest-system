import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('ScoresController', () => {
  let app: INestApplication;

  let adminToken: string;
  let judgeToken: string;
  let participantToken: string;
  let judgeId: string;
  let assignedContestId: string;
  let unassignedContestId: string;
  let testTeamId: string;
  let testSubmissionId: string;
  let unassignedSubmissionId: string;
  let testCriteriaId: string;
  let createdScoreId: string;

  const randomSuffix = Math.floor(Math.random() * 100000);

  const judge = {
    username: `scorespec_j_${randomSuffix}`,
    email: `scorespec_j_${randomSuffix}@example.com`,
    password: 'password123',
    role: 'judge',
  };

  const participant = {
    username: `scorespec_p_${randomSuffix}`,
    email: `scorespec_p_${randomSuffix}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = adminRes.body.token;

    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(judge)
      .expect(201);

    const judgeRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: judge.email, password: judge.password });
    judgeToken = judgeRes.body.token;
    judgeId = judgeRes.body.user.id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(participant)
      .expect(201);

    const participantRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: participant.email, password: participant.password });
    participantToken = participantRes.body.token;

    const assignedContestRes = await request(app.getHttpServer())
      .post('/contests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Score Spec Assigned Contest ${randomSuffix}`,
        startDate: '2027-01-01T00:00:00.000Z',
        endDate: '2027-12-31T00:00:00.000Z',
        submissionDeadline: '2027-11-30T00:00:00.000Z',
      })
      .expect(201);
    assignedContestId = assignedContestRes.body.id;

    const unassignedContestRes = await request(app.getHttpServer())
      .post('/contests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Score Spec Unassigned Contest ${randomSuffix}`,
        startDate: '2027-01-01T00:00:00.000Z',
        endDate: '2027-12-31T00:00:00.000Z',
        submissionDeadline: '2027-11-30T00:00:00.000Z',
      })
      .expect(201);
    unassignedContestId = unassignedContestRes.body.id;

    await request(app.getHttpServer())
      .post('/judge-assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        contestId: assignedContestId,
        judgeId,
      })
      .expect(201);

    const criteriaRes = await request(app.getHttpServer())
      .post('/judging-criteria')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        contestId: assignedContestId,
        name: `Score Spec Criteria ${randomSuffix}`,
        description: 'Main judging criteria',
        maxScore: 10,
      })
      .expect(201);
    testCriteriaId = criteriaRes.body.id;

    const teamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({
        name: `Score Spec Team ${randomSuffix}`,
        contestId: assignedContestId,
      })
      .expect(201);
    testTeamId = teamRes.body.id;

    const submissionRes = await request(app.getHttpServer())
      .post('/submissions')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({
        teamId: testTeamId,
        contestId: assignedContestId,
        title: `Score Spec Submission ${randomSuffix}`,
      })
      .expect(201);
    testSubmissionId = submissionRes.body.id;

    const unassignedTeamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({
        name: `Score Spec Unassigned Team ${randomSuffix}`,
        contestId: unassignedContestId,
      })
      .expect(201);

    const unassignedSubmissionRes = await request(app.getHttpServer())
      .post('/submissions')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({
        teamId: unassignedTeamRes.body.id,
        contestId: unassignedContestId,
        title: `Unassigned Contest Submission ${randomSuffix}`,
      })
      .expect(201);
    unassignedSubmissionId = unassignedSubmissionRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /scores', () => {
    it('returns 201 with the created score when the judge is assigned to the contest', async () => {
      const response = await request(app.getHttpServer())
        .post('/scores')
        .set('Authorization', `Bearer ${judgeToken}`)
        .send({
          submissionId: testSubmissionId,
          criteriaId: testCriteriaId,
          score: 8,
          feedback: 'solid submission',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.submissionId).toEqual(testSubmissionId);
      expect(response.body.score).toEqual(8);

      createdScoreId = response.body.id;
    });

    it('returns 403 when the judge is not assigned to the contest', () => {
      return request(app.getHttpServer())
        .post('/scores')
        .set('Authorization', `Bearer ${judgeToken}`)
        .send({
          submissionId: unassignedSubmissionId,
          criteriaId: testCriteriaId,
          score: 5,
        })
        .expect(403);
    });

    it('returns 400 when the score exceeds the criteria max_score', () => {
      return request(app.getHttpServer())
        .post('/scores')
        .set('Authorization', `Bearer ${judgeToken}`)
        .send({
          submissionId: testSubmissionId,
          criteriaId: testCriteriaId,
          score: 999,
        })
        .expect(400);
    });

    it('returns 409 when the same judge scores the same submission and criteria twice', () => {
      return request(app.getHttpServer())
        .post('/scores')
        .set('Authorization', `Bearer ${judgeToken}`)
        .send({
          submissionId: testSubmissionId,
          criteriaId: testCriteriaId,
          score: 7,
        })
        .expect(409);
    });
  });

  describe('GET /scores/:id', () => {
    it('returns 200 with score data for a valid existing uuid', () => {
      return request(app.getHttpServer())
        .get(`/scores/${createdScoreId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toEqual(createdScoreId);
          expect(response.body).toHaveProperty('submissionId');
          expect(response.body).toHaveProperty('judgeId');
          expect(response.body).toHaveProperty('criteriaId');
          expect(response.body).toHaveProperty('score');
        });
    });
  });

  describe('DELETE /scores/:id', () => {
    it('returns 204 with no body when the judge deletes their own score', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/scores/${createdScoreId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(204);

      expect(response.body).toEqual({});
    });
  });
});
