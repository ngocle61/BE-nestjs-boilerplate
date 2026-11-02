# Knowledge index

Map of ingested documents. Search for detail: `kb.py search "<topic>"`.

## AGENTS.md  (860 words, 5 chunks)
- Agent Guide (BE): NestJS 12 API for the React boilerplate in  ../FE react boilerplate .
- Agent Guide (BE) > Stack: Node 24 · NestJS 12 (ESM,  nodenext ) · TypeScript 7 ( tsc , with the TypeScript 6 API kept for the Nest CLI) · Prisma ORM 7 +  @prisma/adapter pg  · PostgreSQL
- Agent Guide (BE) > Commands: Command   Purpose     :    :       npm run start:dev    API on http://localhost:3001/api with watch mode      npm run verify    Typecheck + lint + unit tests
- Agent Guide (BE) > Structure: 
- Agent Guide (BE) > Conventions: One feature module per folder directly under  src/  ( auth/ ,  users/ , later  interventions/ ,  chat/ ).

## README.md  (706 words, 8 chunks)
- BE NestJS Boilerplate: NestJS 12 + PostgreSQL 18 backend for the React boilerplate in  ../FE react boilerplate .
- BE NestJS Boilerplate > Setup: Use the PostgreSQL 18 server installed on your machine.
- BE NestJS Boilerplate > API: Endpoint   Auth   Request   Response     :    :    :    :       POST /auth/sign in    Public    { email, password }     { accessToken, refreshToken, user }
- BE NestJS Boilerplate > AI chat: POST /chat/messages  forwards the conversation to any OpenAI compatible chat completions API.
- BE NestJS Boilerplate > Security: Passwords are hashed with argon2id; sign in spends the same time whether or not the e mail exists.
- BE NestJS Boilerplate > Scripts: Script   Description     :    :       npm run start:dev    Watch mode      npm run build    Compile to  dist/       npm run start:prod    Run the compiled build

## .qa\how-to-test.md  (73 words, 1 chunks)
- How to test: The user's words:   ok.
