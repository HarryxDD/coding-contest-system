import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('TeamsController', () => {
  let app: INestApplication;

  let adminToken: string;
  let participantToken: string;
  let otherParticipantToken: string;
  let testContestId: string;
  let createdTeamId: string;

  const randomSuffix = Math.floor(Math.random() * 100000);

  const participant = {
    username: `teamspec_p1_${randomSuffix}`,
    email: `teamspec_p1_${randomSuffix}@example.com`,
    password: 'password123',
  };
  const otherParticipant = {
    username: `teamspec_p2_${randomSuffix}`,
    email: `teamspec_p2_${randomSuffix}@example.com`,
    password: 'password123',
  };

  const contestPayload = {
    name: `Teams Spec Contest ${randomSuffix}`,
    description: 'contest created for teams spec',
    maxTeamSize: 4,
    startDate: '2027-06-01T00:00:00.000Z',
    endDate: '2027-06-15T00:00:00.000Z',
    submissionDeadline: '2027-06-12T00:00:00.000Z',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // register fresh test participants so each run is isolated
    await request(app.getHttpServer()).post('/auth/register').send(participant);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(otherParticipant);

    // login as seeded admin — admin can create contests (POST /contests requires organizer or admin)
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = adminRes.body.token;

    // create a contest so we have a valid contest id to attach teams to
    const contestRes = await request(app.getHttpServer())
      .post('/contests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(contestPayload);
    testContestId = contestRes.body.id;

    // get participant tokens
    const p1Res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: participant.email, password: participant.password });
    participantToken = p1Res.body.token;

    const p2Res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: otherParticipant.email,
        password: otherParticipant.password,
      });
    otherParticipantToken = p2Res.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /teams', () => {
    // authenticated user gets back the standard infinity pagination envelope
    it('returns 200 with paginated data for an authenticated user', () => {
      return request(app.getHttpServer())
        .get('/teams')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('page');
          expect(response.body).toHaveProperty('totalItems');
          expect(Array.isArray(response.body.data)).toBeTruthy();
        });
    });
  });

  describe('POST /teams', () => {
    // valid participant with a real contest id — service creates team and auto-joins creator
    it('returns 201 and the created team when jwt is valid and role is participant', async () => {
      const teamPayload = {
        name: `Team Alpha ${randomSuffix}`,
        contestId: testContestId,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${participantToken}`)
        .send(teamPayload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toEqual(teamPayload.name);
      expect(response.body.contestId).toEqual(testContestId);

      // store for follow-up tests that need a real team id
      createdTeamId = response.body.id;
    });

    // no authorization header — jwt guard should reject at the gateway
    it('returns 401 when no jwt is provided', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .send({ name: 'Ghost Team', contestId: testContestId })
        .expect(401);
    });

    // contestId is missing from the body — validation pipe should reject it
    it('returns 400 when the request body is invalid', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ name: 'Incomplete Team' }) // missing contestId
        .expect(400);
    });
  });

  describe('GET /teams/:id', () => {
    // happy path — id exists and data should come back mapped through domain
    it('returns 200 with team data for a valid existing uuid', () => {
      return request(app.getHttpServer())
        .get(`/teams/${createdTeamId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toEqual(createdTeamId);
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('contestId');
          expect(response.body).toHaveProperty('createdAt');
          expect(response.body).toHaveProperty('members');
          expect(Array.isArray(response.body.members)).toBeTruthy();
          expect(response.body.members).toHaveLength(1);
          expect(response.body.members[0]).toHaveProperty('id');
          expect(response.body.members[0]).toHaveProperty('userId');
          expect(response.body.members[0]).toHaveProperty('joinedAt');
          expect(response.body.members[0]).not.toHaveProperty('teamId');
        });
    });

    // uuid format is correct but there is no matching row in the db
    it('returns 404 when the team does not exist', () => {
      return request(app.getHttpServer())
        .get('/teams/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    // param is not a uuid — ParseUUIDPipe should catch this before the service runs
    it('returns 400 when the id is not a valid uuid format', () => {
      return request(app.getHttpServer())
        .get('/teams/not-a-valid-uuid')
        .expect(400);
    });
  });

  describe('PATCH /teams/:id', () => {
    // otherParticipant is not the creator — service verifyCreatorOrAdmin should throw 403
    it('returns 403 when the requesting user is not the team creator', () => {
      return request(app.getHttpServer())
        .patch(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${otherParticipantToken}`)
        .send({ name: 'Unauthorized Name Change' })
        .expect(403);
    });
  });

  describe('DELETE /teams/:id', () => {
    // creator removes their own team — should respond with 204 and an empty body
    it('returns 204 with no body when the team creator deletes the team', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(204);

      expect(response.body).toEqual({});
    });
  });
});
