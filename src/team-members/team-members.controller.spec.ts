import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('TeamMembersController', () => {
  let app: INestApplication;

  let adminToken: string;
  let participantToken: string;
  let otherParticipantToken: string;
  let thirdParticipantToken: string;
  let testTeamId: string;
  let participant1MemberId: string;

  const randomSuffix = Math.floor(Math.random() * 100000);

  const participant1 = {
    username: `tm_p1_${randomSuffix}`,
    email: `tm_p1_${randomSuffix}@example.com`,
    password: 'password123',
  };
  const participant2 = {
    username: `tm_p2_${randomSuffix}`,
    email: `tm_p2_${randomSuffix}@example.com`,
    password: 'password123',
  };
  // third participant is used to trigger the full-team 400 scenario
  const participant3 = {
    username: `tm_p3_${randomSuffix}`,
    email: `tm_p3_${randomSuffix}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // register three fresh participants for this test suite
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(participant1);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(participant2);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(participant3);

    // login as the seeded admin to create a contest with a tight team size
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = adminRes.body.token;

    // maxTeamSize: 2 means after participant1 creates the team (auto-joined),
    // only one more spot is left — used to exercise the full-team 400 scenario
    const contestRes = await request(app.getHttpServer())
      .post('/contests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `TM Spec Contest ${randomSuffix}`,
        description: 'contest for team-members spec',
        maxTeamSize: 2,
        startDate: '2027-07-01T00:00:00.000Z',
        endDate: '2027-07-15T00:00:00.000Z',
        submissionDeadline: '2027-07-12T00:00:00.000Z',
      });
    const testContestId = contestRes.body.id;

    // login all three participants
    const p1Res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: participant1.email, password: participant1.password });
    participantToken = p1Res.body.token;

    const p2Res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: participant2.email, password: participant2.password });
    otherParticipantToken = p2Res.body.token;

    const p3Res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: participant3.email, password: participant3.password });
    thirdParticipantToken = p3Res.body.token;

    // participant1 creates the team — service auto-adds them as the first member
    const teamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({ name: `TM Spec Team ${randomSuffix}`, contestId: testContestId });
    testTeamId = teamRes.body.id;

    // fetch participant1's membership record so delete tests have a real id to target
    const membersRes = await request(app.getHttpServer())
      .get('/team-members')
      .query({ filters: JSON.stringify({ teamId: testTeamId }) })
      .set('Authorization', `Bearer ${participantToken}`);
    participant1MemberId = membersRes.body.data[0]?.id;
    if (!participant1MemberId)
      throw new Error('setup failed: no member record found');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /team-members', () => {
    // participant1 is already a member of the team (auto-joined on creation) — service should throw 409
    it('returns 409 when the user is already a member of the team', () => {
      return request(app.getHttpServer())
        .post('/team-members')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ teamId: testTeamId }) // no userId, so service uses the requesting user's id
        .expect(409);
    });

    // fill the last remaining slot then try to squeeze in one more person
    it('returns 400 when the team has already reached its max size', async () => {
      // participant2 joins (2/2 — now full)
      await request(app.getHttpServer())
        .post('/team-members')
        .set('Authorization', `Bearer ${otherParticipantToken}`)
        .send({ teamId: testTeamId });

      // participant3 tries to join — team is at capacity so service throws 400
      return request(app.getHttpServer())
        .post('/team-members')
        .set('Authorization', `Bearer ${thirdParticipantToken}`)
        .send({ teamId: testTeamId })
        .expect(400);
    });
  });

  describe('DELETE /team-members/:id', () => {
    // participant2 attempts to remove participant1's membership — only the member or admin can do that
    it('returns 403 when the requesting user is not the owner of the membership', () => {
      return request(app.getHttpServer())
        .delete(`/team-members/${participant1MemberId}`)
        .set('Authorization', `Bearer ${otherParticipantToken}`)
        .expect(403);
    });
  });
});
