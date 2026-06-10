# AGENTS

## Fast facts
- Package manager is `pnpm` (lockfile + CI use `pnpm`); use `pnpm install` and `pnpm <script>`.
- This is a single-package ESM TypeScript library (`"type": "module"`), not a monorepo.
- Public entrypoint is `src/index.ts`, default export target is `src/client.ts` (`NetsuiteApiClient`).

## Verified commands
- Build: `pnpm build` (runs `tsc --build --clean && tsc`, outputs to `dist/`).
- Tests: `pnpm test` (Vitest).
- Coverage (CI command): `pnpm coverage`.
- Single test file: `pnpm test -- test/request.test.ts`.
- Single test case: `pnpm test -- test/request.test.ts -t "should work with base_url"`.

## Test and env gotchas
- Tests are integration-heavy, not unit-only: they call real NetSuite endpoints.
- Required env vars are loaded from `.env` via `dotenv/config`; copy `.env.sample` keys exactly.
- `test/request.test.ts` creates and then deletes a customer record; avoid running against sensitive production data.
- CI injects NetSuite secrets and runs coverage on pull requests (`.github/workflows/node.js.yml`).
- Vitest timeout is `20000` ms (`vitest.config.ts`), so network tests are expected.

## Code behavior that is easy to miss
- URL construction defaults to `https://{realm}.suitetalk.api.netsuite.com/services/rest/{path}`.
- `base_url` overrides realm-host construction and is sanitized to remove trailing slash.
- `path` is sanitized to remove one leading slash; `restletUrl` bypasses normal URL construction entirely.
- `request()` parses JSON response bodies and wraps `got` `HTTPError` as `NetsuiteError` with NetSuite detail text when possible.
- `query()` enforces `limit <= 1000` and strips tabs/newlines before sending SuiteQL.
