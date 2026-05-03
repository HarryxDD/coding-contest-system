# Reflection and Analysis - Coding Contest System

## Future Work

**Authentication and Security**
The dual authentication system (JWT + Personal Access Tokens) is functional, but could be enhanced with OAuth2/OpenID Connect integration for institutional identity providers. Currently, PAT scopes are role-based; fine-grained, endpoint-level scoping would provide tighter security boundaries for third-party integrations—for example, a token that can only read submissions but not scores.

**Caching Strategy**
Caching is currently implemented only on the contest list endpoint. The judging criteria and judge assignments endpoints would benefit significantly from caching since they rarely change after initial contest setup. We could also implement selective cache invalidation patterns when dependencies update, rather than full cache flushes.

**HATEOAS Expansion**
Currently only submissions include hypermedia links. Extending this to team resources (links to members, contest, submissions) and contest resources (links to teams, submissions, scoring) would make the API more discoverable and reduce client-side hardcoding of URL patterns. This would enable true REST level 3 maturity.

**Real-time Updates**
The scoring workflow is request-response based. WebSocket integration would allow judges to receive real-time updates when a submission receives new scores, and organizers to see scoring progress live. This would improve the judging experience, especially in time-constrained contests.

**Infrastructure and DevOps**
The Dockerfile and docker-compose setup work well for development. Production deployment would benefit from multi-stage builds to reduce image size, health checks for the PostgreSQL service, and secrets management (currently environment variables). SSL/TLS termination via reverse proxy and automated CI/CD pipelines would strengthen deployment reliability.

## Lessons Learnt

**Hexagonal Architecture in Practice**
Reading about hexagonal architecture was abstract until implementing it across 9 modules. Separating business logic into domain entities (Submission, Team, Contest) from infrastructure repositories made it genuinely easy to swap implementations. For example, the submission mapper applies business rules consistently across controllers, services, and database queries. This separation meant that adding the PAT authentication didn't require changing service logic—only the guard layer. The repetition across modules (each has domain/, dto/, infrastructure/) initially felt verbose, but the consistency made adding new modules straightforward.

**Repository Pattern Complexity**
The repository pattern with TypeORM worked well for standard CRUD operations but became cumbersome for complex queries. Methods like `findBySubmissionJudgeCriteria` in the score repository show the pattern's limits—we're essentially SQL queries wrapped in methods. For future work requiring more analytical queries (e.g., scoring statistics per judge, submission velocity per contest), an explicit query layer or read models would be cleaner than expanding repositories further.

**Type Safety in Validation**
Using class-validator decorators + class-transformer is excellent for request validation, but I discovered edge cases. Date string validation requires custom validators; enum validation needs specific decorators. We spent time debugging why date inputs were rejected before realizing class-validator doesn't handle date strings by default. TypeScript's type system catches structural issues but not all runtime validation concerns.

**PostgreSQL Schema Design Decisions**
We chose normalized tables with foreign keys to maintain referential integrity. This prevented orphaned submissions or scores. However, it made queries involving aggregations (e.g., "get total scores per submission") require multiple joins. Early in the project, we debated adding denormalized fields like `totalScore` on submissions, but avoided it to keep writes consistent. The trade-off is acceptable for this use case, but it's a lesson in how schema decisions impact query complexity downstream.

**Error Handling as Documentation**
Writing specific error messages (e.g., "you are not assigned to judge this contest" vs. generic 403) makes the API self-documenting. During implementation, detailed exceptions forced us to think through authorization rules explicitly. When adding judge assignment validation in the scores service, we caught several edge cases (e.g., what if a judge's assignment is revoked mid-scoring?) that prompted clearer business rules.

**Testing Trade-offs**
We implemented E2E tests with Supertest to verify entire workflows, which caught integration issues early. However, E2E tests are slower and harder to debug than unit tests. We acknowledged the gap but prioritized coverage of critical paths (authentication, submission creation, scoring) over exhaustive service layer unit tests. This felt pragmatic but revealed that tests and code both need maintenance—when we refactored the contests service, tests had to be updated in parallel.

## Comments about the project

**What went well:**
The project delivered a functional, production-ready REST API with clear separation of concerns. Role-based access control, PAT support, and comprehensive Swagger documentation make the API usable immediately. The Dockerfile and docker-compose setup enabled consistent development environments and simplified deployment. Adding a new module (e.g., scores) followed a clear pattern: create dto/, infrastructure/, service, controller, tests. This reduced cognitive overhead after the first few modules.

**Challenges encountered:**
The most time-consuming aspect was data modeling. Deciding which relationships to normalize, when to use foreign keys vs. denormalized fields, and how to structure entities to support all query patterns required multiple iterations. We initially lacked clarity on the distinction between a judge assignment and actual score records—reorganizing this mid-project cost time. Debugging TypeORM behaviors (lazy-loading relationships, cascade deletion) also consumed time; the ORM documentation examples didn't cover all scenarios we needed.

The dual authentication system (JWT + PAT) added complexity. Implementing `JwtOrPatAuthGuard` required handling two different token formats and validation paths. The PAT scoping logic within `PatService` became intricate—maintaining allowed scopes per role and validating them on every request added overhead. It's necessary for enterprise API usage, but the complexity is real.

**Code quality observations:**
The codebase maintains consistent patterns. Every service includes JSDoc comments explaining parameters and exceptions, making navigation straightforward. The use of ParseUUIDPipe in controllers catches malformed UUIDs early. Proper HTTP status codes (201 for creation, 204 for successful deletion) are respected throughout. However, there are opportunities: some DTOs have optional fields but no documentation of when they're required; pagination could be wrapped in a reusable abstraction to reduce code duplication across controllers.

## Comments about the course

**Structure and Content:**
This course successfully integrated architectural theory with practical implementation. The progression from simple CRUD endpoints to role-based access control and enterprise authentication patterns mirrors real-world API evolution. The requirement to use Swagger forced documentation writing as we built, which is professional practice—too many projects document after the fact or not at all.

**Feedback Quality:**
The most valuable feedback wasn't about code syntax but about design tradeoffs. When instructors questioned why we chose PostgreSQL's normalization over document flexibility or why we added PAT support before essential features, it made us articulate decisions we'd taken for granted. This kind of critical thinking—explaining the "why" behind choices—is what distinguishes engineering from coding.

**Practical vs. Theoretical:**
The balance was good. Lectures covered REST principles, but the project forced us to implement them messily—discovering that HATEOAS links require mappers, that pagination is more than passing `limit` and `offset`, that authorization is context-specific (a user can update their own team but not others'). Theory plus implementation creates understanding in a way neither alone provides.

**Team Dynamics:**
Working on a single codebase with three other developers taught version control discipline and code review mindset. Merging multiple modules into a cohesive system required consistent patterns—if one developer used different repository signatures, others couldn't understand them. This enforced high communication.

**What could be improved:**
Earlier deployment guidance would have helped. The docker-compose setup is mentioned, but deploying to actual cloud infrastructure (CSC cPouta) was a separate learning curve. Integration with CI/CD earlier in the project would have prevented last-minute deployment surprises. Additionally, data persistence and database schema migration strategies deserved more emphasis—we discovered late that schema synchronization isn't suitable for all environments.

---

**Summary:**
This project taught the difference between writing code and building production systems. Architecture matters when teams work together. Validation, error handling, and security aren't afterthoughts—they're integral to the design. The REST principles covered in the course are genuine; implementing them reveals complexity often glossed over in tutorials. The hexagonal architecture pattern, when applied consistently, genuinely supports modularity and testing. Most importantly, a well-structured backend isn't about complexity for its own sake—it's about enabling other developers (and future-you) to extend and maintain the system confidently.
