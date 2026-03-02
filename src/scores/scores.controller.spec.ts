import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('ScoresController', () => {
  let app: INestApplication;

  let adminToken: string;
  let judgeToken: string;
  let participantToken: string;

  // ids resolved from seeded and freshly created data
  let springContestId: string;
  let unassignedContestId: string;
  let testTeamId: string;
  let testSubmissionId: string;
  let unassignedSubmissionId: string;
  let testCriteriaId: string;
  let createdScoreId: string;

  const randomSuffix = Math.floor(Math.random() * 100000);

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

    // login as seeded admin
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = adminRes.body.token;

    // login as seeded judge — already assigned to spring hackathon 2026 via seed
    const judgeRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'judge@example.com', password: 'judge123' });
    judgeToken = judgeRes.body.token;

    // register and login fresh participant
    await request(app.getHttpServer()).post('/auth/register').send(participant);
    const pRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: participant.email, password: participant.password });
    participantToken = pRes.body.token;

    // find spring hackathon 2026 which has the seeded judge assignment and criteria
    const contestsRes = await request(app.getHttpServer())
      .get('/contests')
      .set('Authorization', `Bearer ${adminToken}`);
    const springHackathon = contestsRes.body.data.find(
      (c: { name: string }) => c.name === 'Spring Hackathon 2026',
    );
    springContestId = springHackathon.id;

    // create a second contest where the seeded judge is NOT assigned
    const unassignedContestRes = await request(app.getHttpServer())
      .post('/contests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Score Spec Unassigned Contest ${randomSuffix}`,
        startDate: '2027-01-01T00:00:00.000Z',
        endDate: '2027-12-31T00:00:00.000Z',
        submissionDeadline: '2027-11-30T00:00:00.000Z',
      });
    unassignedContestId = unassignedContestRes.body.id;

    // participant creates a team in spring hackathon so they can submit there
    const teamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({ name: `Score Spec Team ${randomSuffix}`, contestId: springContestId });
    testTeamId = teamRes.body.id;

    // participant creates a submission for that team in spring hackathon
    const submissionRes = await request(app.getHttpServer())
      .post('/submissions')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({
        teamId: testTeamId,
        contestId: springContestId,
        title: `Score Spec Submission ${randomSuffix}`,
      });
    testSubmissionId = submissionRes.body.id;

    // participant creates a team in the unassigned contest for the 403 test
    const unassignedTeamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({
        name: `Score Spec Unassigned Team ${randomSuffix}`,
        contestId: unassignedContestId,
      });
    const unassignedTeamId = unassignedTeamRes.body.id;

    // participant creates a submission in the unassigned contest
    const unassignedSubRes = await request(app.getHttpServer())
      .post('/submissions')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({
        teamId: unassignedTeamId,
        contestId: unassignedContestId,
        title: `Unassigned Contest Submission ${randomSuffix}`,
      });
    unassignedSubmissionId = unassignedSubRes.body.id;

    // get the first available criteria for spring hackathon
    const criteriaRes = await request(app.getHttpServer())
      .get(`/judging-criteria?contestId=${springContestId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    testCriteriaId = criteriaRes.body.data[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /scores', () => {
    // judge assigned to spring hackathon scores a fresh submission with valid criteria
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

      // store for get and delete tests
      createdScoreId = response.body.id;
    });

    // judge is not assigned to the unassigned contest — service should throw 403
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

    // score of 999 exceeds the max_score of 10 in the seeded criteria
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

    // judge already scored this submission+criteria combo — duplicate returns 409
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
    // happy path — score exists and data should come back as a domain object
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
    // judge deletes their own score — should respond with 204 and empty body
    it('returns 204 with no body when the judge deletes their own score', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/scores/${createdScoreId}`)
        .set('Authorization', `Bearer ${judgeToken}`)
        .expect(204);

      expect(response.body).toEqual({});
    });
  });
});
