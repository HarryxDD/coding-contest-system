# PWP Spring 2026

# Coding Contest System API

## Group information

- Student 1. Vu Truong - Vu.Truong@student.oulu.fi
- Student 2. Mubeen Khan - Mubeen.Khan@student.oulu.fi
- Student 3. Eshmam Rayed - Eshmam.Rayed@student.oulu.fi
- Student 4. Muhammad Abdur Rehman - Muhammad.AbdurRehman@student.oulu.fi

## Overview

This is a NestJS REST API for managing coding contests and hackathons. The system handles user authentication, contest management, team formation, project submissions, judge assignments, scoring criteria, and score recording.

Authentication supports both JWT Bearer tokens and Personal Access Tokens (PATs). PATs allow users to generate scoped tokens with specific permissions that can be shared with external tools or integrations.

The project uses PostgreSQL as the database and TypeORM as the ORM layer. It follows a hexagonal architecture where business logic is fully decoupled from the database layer.

## Tech stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Passport.js with JWT strategy
- class-validator and class-transformer for request validation
- Jest and Supertest for E2E testing
- Swagger for API documentation

## Prerequisites

- Node.js 16 or newer
- npm 8 or newer
- PostgreSQL (local or via Docker)

## Installation

```bash
npm install
```

## Environment configuration

Copy `env-example` to `.env` and adjust the values for your setup:

```bash
cp env-example .env
```

Example local configuration:

```env
NODE_ENV=development
APP_PORT=3000
APP_NAME="Coding Contest System"
API_PREFIX=api

DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=root
DATABASE_PASSWORD=secret
DATABASE_NAME=contest_system
DATABASE_SYNCHRONIZE=true
DATABASE_MAX_CONNECTIONS=100
DATABASE_SSL_ENABLED=false
DATABASE_REJECT_UNAUTHORIZED=false
DATABASE_CA=
DATABASE_KEY=
DATABASE_CERT=
DATABASE_URL=

FILE_DRIVER=local

AUTH_JWT_SECRET=secret
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=secret_for_refresh
AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d
AUTH_FORGOT_SECRET=secret_for_forgot
AUTH_FORGOT_TOKEN_EXPIRES_IN=30m
AUTH_CONFIRM_EMAIL_SECRET=secret_for_confirm_email
AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN=1d
```

If you run PostgreSQL through Docker Compose, set `DATABASE_HOST=postgres` instead of `localhost`.

## Database setup

The project uses TypeORM schema synchronization in development (`DATABASE_SYNCHRONIZE=true`), so no migration files need to be run manually. The schema is created automatically when the app starts.

### Option 1: local PostgreSQL

Create the database manually:

```sql
CREATE DATABASE contest_system;
```

Then make sure your `.env` points to your local PostgreSQL instance.

### Option 2: Docker Compose

The repository includes a `docker-compose.yaml` file. Start PostgreSQL with:

```bash
docker compose up -d postgres
```

An Adminer instance is also available for browsing the database in a browser:

```bash
docker compose up -d adminer
```

Adminer runs at `http://localhost:8080`.

## Seed data

Populate the database with example data:

```bash
npm run seed:run
```

The seed data covers users, contests, teams, team members, submissions, judge assignments, judging criteria, and scores. This is enough to test all API endpoints without creating data manually.

## Running the API

Development mode with hot reload:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

## API entry point

The app listens on port `3000` by default.

| | URL |
|---|---|
| Base | `http://localhost:3000` |
| API prefix | `http://localhost:3000/api` |
| Swagger docs | `http://localhost:3000/docs` |

All endpoints are documented and testable through the Swagger UI. You can authorize using a JWT token from `POST /auth/login` or a PAT from `POST /pat`.

## Testing

Run tests with coverage report:

```bash
npm run test
```

Run a specific test file:

```bash
npm run test -- teams.controller.spec.ts
```

## NestJS Best Practices

This project follows key NestJS architectural principles:

### Official Documentation

Refer to the official NestJS documentation for comprehensive guidance on architecture and development patterns:

- NestJS Official Documentation - https://docs.nestjs.com/
- NestJS Fundamentals - https://docs.nestjs.com/first-steps
- Modules and Dependency Injection - https://docs.nestjs.com/modules
- Pipes and Validation - https://docs.nestjs.com/pipes
- Guards and Authorization - https://docs.nestjs.com/guards
- Database Integration - https://docs.nestjs.com/techniques/database

### Implementation in This Project

1. Modular Architecture - Feature modules for users, contests, teams, etc. with clear separation
2. Dependency Injection - Services managed by NestJS DI container
3. Guards and Decorators - JWT authentication and role-based access control
4. Pipe Validation - ValidationPipe for DTOs and ParseUUIDPipe for URL parameters
5. Comprehensive Testing - E2E tests with Supertest for full request/response cycles
6. API Documentation - Swagger/OpenAPI integration

## Notes

To run tests successfully, make sure a PostgreSQL instance is running and the `.env` file is configured correctly before starting the test suite.

## License

This project was developed for educational use as part of a University of Oulu web programming course.