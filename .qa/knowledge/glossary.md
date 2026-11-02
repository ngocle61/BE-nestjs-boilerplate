# Terms defined in the docs

- **What that means for a QA run**: - Follow the user story (US) first: its acceptance criteria decide what to test and what counts as correct.  [.qa\how-to-test.md]
- **Errors**: `{ code, message, errors? }`, for example `401 { "code": "invalid_credentials" }` or `400 { "code": "validation_failed", "errors": { "email": ["Invalid email address"] } }`.  [README.md]
- **Figma**: https://www.figma.com/design/<file-key>/<name>?node-id=<node-id>  [user-story\README.md]
- **Report to the user**: - each acceptance criterion as PASS, FAIL or PENDING, with its evidence  [user-story\README.md]
