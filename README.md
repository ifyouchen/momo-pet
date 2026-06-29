# Project Momo

Project Momo is an AI desktop pet MVP built as a monorepo. The desktop client targets both Windows and macOS.

## Workspace

```text
apps/backend                Spring Boot backend
apps/desktop                Tauri + React desktop client
apps/admin                  React admin console
packages/pet-runtime        Client-side pet state machine
packages/animation-engine   Sprite and animation playback
packages/ui                 Shared React UI
packages/shared             Shared TypeScript contracts
native/windows              Windows-specific native capability notes
native/macos                macOS-specific native capability notes
ai/pet-dna                  Pet DNA AI assets
ai/life-engine              Life Engine AI assets
ai/story-engine             Future Pet Story AI assets
ai/prompt-library           Runtime prompt assets
assets/sprites              Sprite assets
assets/sounds               Sound assets
assets/themes               Theme assets
docs                        Product, UX, AI, backend, QA, and execution documents
```

## Architecture Principle

```text
React draws the pet.
Rust controls the window.
Java runs the brain.
Packages keep shared consensus.
Assets own presentation.
Docs own decisions.
```

- React owns pet rendering, animation surfaces, interaction UI, Pet Studio, chat panels, and state display.
- Rust/Tauri owns transparent windows, always-on-top behavior, dragging, Windows tray, macOS menu bar, local files, and platform adapters.
- Java/Spring Boot owns Pet DNA, Life Engine, Memory, AI tasks, persistence, backend APIs, and Admin data.
- TypeScript packages own shared runtime logic, UI primitives, client contracts, and animation playback helpers.
- Assets own sprites, sounds, themes, and fallback presentation resources.
- Docs own product decisions, acceptance criteria, and coding constraints.

## Requirements

- Java 21 for the Spring Boot 3.3 backend.
- Maven 3.9+.
- Node.js 24+.
- pnpm 11+.
- Rust and Cargo are required before running the Tauri shell on Windows or macOS.
- macOS packaging later requires Apple signing and notarization setup.

## Install

```bash
pnpm install
```

## Backend

```bash
cd apps/backend
JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn spring-boot:run
```

Health check:

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{
  "success": true,
  "code": "OK",
  "message": "success",
  "data": {
    "status": "UP",
    "serviceName": "momo-backend"
  }
}
```

## Desktop Frontend

Run the React desktop surface:

```bash
pnpm dev:desktop
```

Run the Tauri shell after Rust is installed:

```bash
pnpm --filter @momo/desktop tauri:dev
```

The Tauri shell owns the transparent pet window, always-on-top behavior, dragging, position restore, tray/menu recovery actions, and the full home window.

## Admin

```bash
pnpm dev:admin
```

## Quality Gates

```bash
pnpm lint
pnpm format:check
pnpm build:desktop
pnpm build:admin
pnpm build:packages
cd apps/backend && JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn test
```

Current verified baseline: frontend lint/build/format checks pass, and backend tests pass on JDK 21.
