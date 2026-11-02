# Project context for QA

## Project brief

Demo project, not a real product. NestJS 12 + PostgreSQL 18 API behind the React frontend in `../FE-react-boilerplate`. The user confirmed this summary and that QA runs locally only, with stories from `user-story/`.

## Verified facts

- Run locally with `npm run start:dev`. The API is at http://localhost:3001/api and Swagger at http://localhost:3001/api/docs (off in production).
- It needs `.env` and a migrated, seeded PostgreSQL database. See README.md.
- `.env` points at a shared cloud database, so writes need the user's approval.
- Every route needs a Bearer token unless marked public. Get one from `POST /auth/sign-in`. It expires after 15 minutes by default.
- Demo accounts: `admin@example.com`, `member@example.com`, `viewer@example.com`.
- No tracker, VPN or feature flags.
