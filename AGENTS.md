# Repository Guidelines

## Project Structure & Module Organization

Project Momo is a pnpm monorepo plus a Spring Boot backend. `apps/desktop` contains the Tauri + React desktop client, with feature code under `apps/desktop/src/features`. `apps/admin` contains the React admin console. `apps/backend` contains Java backend resources. Shared TypeScript packages live in `packages/shared`, `packages/pet-runtime`, `packages/animation-engine`, and `packages/ui`. Product, architecture, QA, and development references live in `docs`; runtime assets live in `assets`; AI prompt assets live in `ai`; platform notes live in `native`.

## Build, Test, and Development Commands

- `pnpm install`: install workspace dependencies using pnpm 10.
- `pnpm dev:desktop`: run the desktop React surface on `127.0.0.1:5173`.
- `pnpm --filter @momo/desktop tauri:dev`: run the full Tauri desktop shell.
- `pnpm dev:admin`: run the admin console on `127.0.0.1:5174`.
- `pnpm build:packages`: type-check shared workspace packages.
- `pnpm build:desktop` / `pnpm build:admin`: type-check and build frontend apps.
- `pnpm lint`: run ESLint recursively across workspace packages.
- `pnpm format:check`: verify Prettier formatting.
- `cd apps/backend && mvn spring-boot:run`: start the backend.
- `cd apps/backend && mvn test`: run backend tests.

## Coding Style & Naming Conventions

TypeScript and React code use ESM, Prettier, and ESLint. Prettier uses 100-character lines, single quotes, semicolons, and trailing commas. ESLint rejects unused variables except `_`-prefixed arguments and disallows `console`. Use PascalCase for React components, camelCase for functions and hooks, and `use-*.ts` or `use-*.tsx` for hooks when following the desktop feature pattern. Java code should follow standard Spring Boot package conventions under `apps/backend/src/main`.

## Testing Guidelines

No test files are currently committed, so add tests close to covered code as behavior lands. Prefer `*.test.ts` or `*.spec.ts` for TypeScript packages and app code. For backend work, place JUnit tests under `apps/backend/src/test/java` and run `mvn test`. Before opening a PR, run the relevant build plus `pnpm lint` and `pnpm format:check`.

## Commit & Pull Request Guidelines

Follow `docs/10-development/GitConvention.md`: use branches like `feature/{domain}-{summary}` or `fix/{domain}-{summary}` and commits in `type(scope): summary` form, for example `feat(desktop): add pet action dock`. Existing history also includes concise Chinese summaries; keep messages short and specific. Pull requests should describe the change, list validation commands, link related issues or docs, and include screenshots or screen recordings for UI changes.

## Security & Configuration Tips

Do not commit local secrets, signing credentials, generated build output, or machine-specific IDE state. Keep backend configuration in `apps/backend/src/main/resources/application.yml` environment-safe, and document required local setup in `docs` when adding new services.
