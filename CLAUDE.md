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
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── invoices/
│   │   ├── analytics/
│   │   └── common/
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

### Guards

- All guards live in `src/common/guards/`
- Use `SessionGuard` to protect all authenticated routes — applied via `@UseGuards(SessionGuard)`
- Never check session inline in a controller

### Serialization

- Always use `plainToInstance(UserDto, ...)` to serialize user responses — no manual object mapping
- This ensures `password` and other excluded fields are never exposed in any response
- `ApiResponse<T>` is the shared response wrapper — lives in `src/common/types/api-response.ts`
- All modules (auth, clients, invoices, analytics) must import `ApiResponse` from `src/common/`

### Frontend

- Components live in `src/components/`, pages in `src/pages/`
- API calls are centralized in `src/services/` — no `fetch`/`axios` calls inside components
- Use custom hooks for all shared stateful logic

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

---

## Future Integrations (Out of MVP Scope)

- Google OAuth (quality of life — standard auth is the priority)
- Forgot/reset password flow (requires Resend + reset token logic)
- Stripe payments + webhook handling
- WebSocket notifications (client onboarded, invoice paid)
- AI late-payment prediction model (Python + scikit-learn)
- Monthly report generation
