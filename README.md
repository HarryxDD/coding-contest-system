# PWP Spring 2026

# Coding Contest System API

## Group information

- Student 1. Vu Truong - Vu.Truong@student.oulu.fi
- Student 2. Mubeen Khan - Mubeen.Khan@student.oulu.fi
- Student 3. Eshmam Rayed - Eshmam.Rayed@student.oulu.fi
- Student 4. Muhammad Abdur Rehman - Muhammad.AbdurRehman@student.oulu.fi

## Overview

This project is a NestJS backend for managing coding contests and hackathons. It covers user authentication, contests, teams, team members, submissions, judge assignments, judging criteria, and scores.

The project uses PostgreSQL as the relational database and TypeORM as the ORM layer.

## Tech stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT authentication
- Jest and Supertest for testing

## Prerequisites

Install the following before running the project:

- Node.js 16 or newer
- npm 8 or newer
- PostgreSQL

Docker is optional. You can either:

- run PostgreSQL on your own machine, or
- run PostgreSQL in Docker and connect the API to it

## Installation

Install dependencies:

```bash
npm install
```

## Environment configuration

The application reads configuration from a `.env` file in the project root.

You can copy `env-example` and adjust it for your setup.

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

If you run PostgreSQL through Docker Compose, set:

```env
DATABASE_HOST=postgres
```

instead of `localhost`.

## Database setup

This repository includes seed scripts, but it does not currently include checked-in migration files. In development, the project relies on TypeORM schema synchronization when `DATABASE_SYNCHRONIZE=true`.

### Option 1: run PostgreSQL locally

1. Create a PostgreSQL database:

```sql
CREATE DATABASE contest_system;
```

2. Make sure your `.env` file points to your local PostgreSQL instance.

### Option 2: run PostgreSQL with Docker

The repository includes a `docker-compose.yaml` file. It can be used to run PostgreSQL in Docker instead of installing PostgreSQL directly on your machine.

Before starting it, make sure your `.env` file uses:

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=root
DATABASE_PASSWORD=secret
DATABASE_NAME=contest_system
```

Then start the database service:

```bash
docker compose up -d postgres
```

An `adminer` service is also included in the compose file if you want a simple browser-based database UI:

```bash
docker compose up -d adminer
```

Adminer will be available at:

```http
http://localhost:8080
```

## Seed data

Populate the database with example data:

```bash
npm run seed:run
```

The seed data includes:

- users
- contests
- teams
- team members
- submissions
- judge assignments
- judging criteria
- scores

## Running the API

Start the API in development mode:

```bash
npm run start:dev
```

Build and run in production mode:

```bash
npm run build
npm run start:prod
```

## API entry point

The app listens on port `3000` by default.

Base URL:

```http
http://localhost:3000
```

API prefix:

```http
http://localhost:3000/api
```

Swagger documentation:

```http
http://localhost:3000/docs
```

## Testing

Run the test suite with:

```bash
npm run test
```

The project uses Jest and Supertest for API-level tests.

## Notes

- This repository contains a Docker Compose file, so Docker support is available as an option.
- Docker is not required if you already have PostgreSQL running locally.
- The project is intended for local development and course evaluation.
- No separate frontend or auxiliary service is included in this repository.

## License

This project was developed for educational use as part of a University of Oulu web programming course.
