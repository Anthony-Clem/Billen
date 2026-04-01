# Billen – Project Brain

## Overview

Billen is a full-stack invoicing and client management platform with an enterprise admin dashboard feel.
Users can onboard clients, send invoices manually or automatically, and view revenue analytics.

---

## Monorepo Structure

```
billen/
├── CLAUDE.md
├── README.md
├── .gitignore
├── backend/          # NestJS + TypeORM + PostgreSQL
│   ├── src/
│   │   ├── common/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── clients/
│   │   │   ├── invoices/
│   │   │   └── analytics/
│   │   ├── utils/
│   │   └── db/
│   ├── test/
│   └── package.json
└── frontend/         # React + Vite + TypeScript
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    └── package.json
```

---

## Tech Stack

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| Backend     | NestJS, TypeScript, TypeORM                  |
| Database    | PostgreSQL                                   |
| Image Store | Tigris S3 Buckets                            |
| Frontend    | React, Vite, TypeScript                      |
| Deployment  | Heroku (backend), Render/Vercel (frontend)   |
| Auth        | Session-based auth + Redis (session storage) |
| PDF Gen     | jsPDF                                        |
| Email       | Resend                                       |
| Payments    | Stripe (future)                              |

---

## Enforced Conventions

### TypeScript

- Strict mode is ON — `"strict": true` in all `tsconfig.json` files
- **Never use `any`** — use `unknown`, proper interfaces, or generics instead
- All DTOs, entities, and response types must be explicitly typed

### Auth

- Use session-based auth — **no JWT**
- Sessions stored in Redis via `connect-redis`
- Session cookie must be `httpOnly`, `sameSite: strict`, and `secure` in production
- Session TTL should be explicitly set — never rely on defaults
- Google OAuth is post-MVP — standard email/password auth only for now
- Forgot/reset password is post-MVP — implement after all core features are shipped
- Password requirements enforced via `@IsStrongPassword()` on `CreateUserDto` — no custom regex needed

### Database

- **Always use TypeORM repositories** — never write raw SQL
- All DB interactions go through the service layer, never directly in controllers
- Migrations required for all schema changes — no `synchronize: true` in production
- Migration naming convention: `<timestamp>-<FeatureName>Migration.ts` (e.g. `1743465600000-ClientsMigration.ts`)
- Embedded address columns follow TypeORM's generated naming: `addressAddress_line1`, `addressAddress_line2`, etc.
- All FK relations must use `ON DELETE CASCADE`

### API Design

- Follow RESTful naming conventions strictly:
  - `GET /clients` — list
  - `GET /clients/:id` — single
  - `POST /clients` — create
  - `PATCH /clients/:id` — update
  - `DELETE /clients/:id` — delete
- All responses follow a consistent shape:
  ```ts
  { data: T, message: string, statusCode: number }
  ```
- Use NestJS exception filters for all error handling — no raw `try/catch` in controllers

### Testing

- **Every route must have a corresponding test** before being merged
- Use Jest + Supertest for e2e tests
- Unit test all service methods
- Test files live in `test/` at the backend root or co-located as `*.spec.ts`

### User DTO

- `GET /me` returns a flat user object — no address, no timestamps: `{ id, name, email }`
- Timestamps can be added back to the DTO if a use case arises
- Never expose `password`, `google_id`, or session internals in any response DTO

### Dev Environment

- Dev DB is SQLite — auto-generated as `db.sqlite` on server start, no setup needed
- Dev Redis is in-memory only — sessions reset on every server restart, this is expected
- No `.env` required for local dev — the app is pre-configured to run out of the box
- Prod requires `REDIS_URL` (e.g. Upstash) — document in `.env.example`
- Prod requires `DATABASE_URL` (Neon PostgreSQL) — document in `.env.example`
- Prod requires `RESEND_API_KEY` — document in `.env.example`
- Prod requires `FRONTEND_URL` — used to build onboarding links, document in `.env.example`

### Guards

- All guards live in `src/common/guards/`
- Use `SessionGuard` to protect all authenticated routes — applied via `@UseGuards(SessionGuard)`
- Never check session inline in a controller

### Serialization

- Always use `plainToInstance(UserDto, ...)` to serialize user responses — no manual object mapping
- This ensures `password` and other excluded fields are never exposed in any response
- `ApiResponse<T>` is the shared response wrapper — lives in `src/common/types/api-response.ts`
- All modules (auth, clients, invoices, analytics) must import `ApiResponse` from `src/common/`

### Client Onboarding Flow

- User inputs client email in a dashboard dialog → backend generates a tokenized invite
- Token stored in Redis with 48 hour TTL — auto-deletes on expiry, no cron job needed
- Token key format: `invite:<token>` — payload: `{ userId, clientEmail, expiresAt }`
- User cache key format: `user:<userId>` — 24hr TTL
- Onboarding URL format: `/onboard?token=<token>&expires=<timestamp>` — expiry in URL for frontend display
- Email copy must mention the 48 hour expiry window (sent via Resend)
- Frontend checks URL expiry client-side to show expired state without a backend call
- Backend validates token exists in Redis and is not expired on form submission
- Client record is only created on successful form submission — never before
- On submit: create client → delete token from Redis
- Client form: email (pre-filled, non-editable), name, address
- Token is a 64-char hex string

### Modules & Wiring

- `RedisModule` and `EmailModule` are `@Global()` — import once in `AppModule`, never in individual modules
- `UserModule` must export `UserService` — consumed by `AuthModule` and `ClientModule`
- All feature modules must provide `SessionGuard` locally for DI
- `AppModule` is the single place to register global modules

### Caching

- Cache current user in Redis after `GET /auth/me` — keyed as `user:<userId>` with 24hr TTL
- Cache-aside lives in `SessionGuard` — check cache → fall back to DB → write to cache
- Invalidate `user:<userId>` on logout — capture userId before destroying session
- Groundwork for caching clients and invoices in later weeks
- Prefer cache-aside pattern: check cache first, fall back to DB, write to cache

### Frontend

- Components live in `src/components/`, pages in `src/pages/`
- API calls are centralized in `src/services/` — no `fetch`/`axios` calls inside components
- Use custom hooks for all shared stateful logic
- All fetch calls must include `credentials: 'include'` — required for session cookies, never remove
- NestJS errors return both string and string-array formats — always normalize both in service calls
- `useAuth()` is the canonical hook for current user state — never duplicate this logic elsewhere
- Vite proxy forwards `/api` → `http://localhost:8000` in dev — all service calls must use `/api` prefix
- `AppLayout` is the authenticated shell — all protected pages must render inside it
- All services follow the `request()` fetch wrapper pattern established in `auth.service.ts` — never write raw fetch calls in a new service
- `/` redirects to `/clients` — default authenticated landing page
- `/onboard` is a public route — no `ProtectedRoute` wrapper

### Forms & Validation

- Use Zod for all frontend form validation — no form libraries
- Zod schemas live in `src/schemas/` — one file per domain (e.g. `auth.schemas.ts`)
- Use `z.flattenError(result.error).fieldErrors` for field-level errors — `error.flatten()` is deprecated in Zod 4
- Display field-level errors inline under each input — never as a single top-level blob
- Backend errors (e.g. "email already in use") surface as a single top-level message only
- React 19: `handleSubmit` must not accept an event parameter — use inline arrow in `onSubmit`: `(e) => { e.preventDefault(); void handleSubmit(); }` — `e` type is inferred from JSX, no import needed

---

## Agents

| Agent          | Persona               | Responsibility                                         |
| -------------- | --------------------- | ------------------------------------------------------ |
| `@nestjs-api`  | Backend NestJS expert | Controllers, services, modules, guards, pipes          |
| `@typeorm-db`  | Database architect    | Entities, migrations, repositories, relations          |
| `@react-ui`    | Frontend React expert | Components, pages, hooks, services                     |
| `@auth-expert` | Auth specialist       | Session management, Redis store, guards, cookie config |

Use isolated agents to keep the main context window clean. Tag the relevant agent when working in their domain.

---

## Lazy-Load Reference Docs

Domain-specific docs live in `/reference/` — load only when needed:

```
reference/
├── nestjs.md       # NestJS module/guard/pipe patterns
├── typeorm.md      # Entity, migration, repository patterns
├── redis.md        # Session store config, TTL, Redis client setup
├── stripe.md       # Stripe integration (future)
├── resend.md       # Email sending via Resend
└── tigris.md       # S3 bucket upload patterns
```

---

## Week-by-Week Focus

| Week | Focus                                                                  |
| ---- | ---------------------------------------------------------------------- |
| 1    | Auth (backend routes + session auth + Redis) + Auth UI + Heroku deploy |
| 2    | Client CRUD + onboarding flow + Client UI                              |
| 3    | Invoice CRUD + PDF gen + CRON jobs + Invoice UI                        |
| 4    | Analytics routes + Analytics UI                                        |
| 5    | Testing, polish, full deploy, README                                   |

---

## Safety Rules

- Never run destructive DB commands (`DROP`, `TRUNCATE`) without explicit confirmation
- Never commit `.env` files — use `.env.example` to document required vars
- Never use `synchronize: true` in TypeORM config outside of local dev
- Background jobs (CRON) must be tested in isolation before deploying
- **Make the minimum changes necessary to complete the task — do not add features, files, or abstractions beyond what is explicitly requested**

---

## Future Integrations (Out of MVP Scope)

- Google OAuth (quality of life — standard auth is the priority)
- Forgot/reset password flow (requires Resend + reset token logic)
- Stripe payments + webhook handling
- WebSocket notifications (client onboarded, invoice paid) — post-MVP, good candidate for onboarding completion notification
- AI late-payment prediction model (Python + scikit-learn)
- Monthly report generation
