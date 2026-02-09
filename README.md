# PWP SPRING 2026

# CODING CONTEST SYSTEM API

# Group information
* Student 1. Vu Truong - Vu.Truong@student.oulu.fi
* Student 2. Mubeen Khan - Mubeen.Khan@student.oulu.fi
* Student 3. Eshmam Rayed
* Student 4. Muhammad Abdur Rehman


__Remember to include all required documentation and HOWTOs, including how to create and populate the database, how to run and test the API, the url to the entrypoint, instructions on how to setup and run the client, instructions on how to setup and run the axiliary service and instructions on how to deploy the api in a production environment__

# Coding Contest System API

Backend REST API for managing coding contests and hackathons.  
The system supports contest creation, team registration, project submissions, and judge-based evaluation using a relational database and a monolithic architecture.

---

## Tech stack

- **Backend framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (tested with PostgreSQL 14+)
- **ORM:** TypeORM
- **Authentication:** JWT (stateless)
- **Runtime:** Node.js (>=16)

---

## Project scope

### What this project includes
- RESTful API for contests, teams, submissions, and judging
- Relational database with constraints and foreign keys
- ORM-based data models
- Database migrations
- Seed scripts with example data
- API documentation support

### What this project does not include
- Frontend or UI
- Real-time features (WebSockets, live updates)
- Payments

---

## Prerequisites

Make sure you have the following installed:
- Node.js (version 16 or newer)
- npm (version 8 or newer)
- PostgreSQL
- Docker (optional, for local PostgreSQL)
---

## Installation

Install dependencies:

```bash
npm install
```
---

## Environment configuration

This project uses environment variables for database configuration.

Create a `.env` file in the project root directory and define the following variables:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=coding_contest_system
```

---

## Database setup and population

### 1. Create the database
Make sure the PostgreSQL database exists before running migrations:
```sql
CREATE DATABASE coding_contest_system;
```

### 2. Run database migrations
Migrations create all tables, indexes, and constraints defined by the ORM models:
```bash
npm run typeorm migration:run
```

### 3. Populate the database with seed data
Run the seed script to insert example data:
```bash
npm run seed:run
```

The seed data includes:
- users (organizer, judge, participant)
- one contest
- judging criteria
- teams and team members
- one final submission
- judge assignments
- example scores

---

## Running the API

### Development mode
Start the API in development mode with hot reload:
```bash
npm run start:dev
```

The API will be available at:
```http
http://localhost:3000
```

### Production mode
Build and run the application in production mode:
```bash
npm run build
npm run start:prod
```

### Testing the API
Run automated tests using:
```bash
npm run test
```

API endpoints can also be tested manually using REST clients such as Postman.

---

## Docker note

Docker is not required to run this project.
It may optionally be used to run PostgreSQL locally, but no Docker configuration is included in this repository.

---

## Auxiliary services

This project does not include any auxiliary services.
All functionality is implemented in a single monolithic backend API, as required by the course.

---

## Deployment note

This project is intended for local development and academic evaluation.
No cloud deployment or CI/CD pipeline is provided.

---

## Entry point

When running locally, the API entry point is:
```http
http://localhost:3000
```
---

## License

This project is developed for educational purposes as part of a Web Programming course of University of Oulu.