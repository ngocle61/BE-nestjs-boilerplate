# Rule-like statements (verify before relying on them)

- Import DTO types with `import type` (required by `isolatedModules` + `emitDecoratorMetadata`).  [AGENTS.md:55]
- Never read `process.env` outside `src/config`.  [AGENTS.md:55]
- Every route is authenticated by default.  [AGENTS.md:55]
- Roles and permissions must stay identical to `../FE-react-boilerplate/src/core/constants`.  [AGENTS.md:55]
- }`, where `message` is a translation key from `ERROR_MESSAGE_KEYS`, never user-facing text.  [AGENTS.md:55]
- Never put a spec next to the file it tests.  [AGENTS.md:55]
- The seed is idempotent (it upserts by fixed e-mail or id, so re-running it never overwrites your edits) and creates:  [README.md:28]
- Access tokens are short-lived JWTs (`JWT_ACCESS_TTL_SECONDS`, default 15 minutes).  [README.md:70]
- Refresh tokens are random, stored only as SHA-256 hashes, rotated on every refresh and revoked on sign-out.  [README.md:70]
