# Score Competency Platform

Starter project for the competency evaluation system using:

- Next.js 15 App Router
- TypeScript
- Prisma + PostgreSQL

## Quick start

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Generate Prisma client with `npm run prisma:generate`
4. Run migrations with `npm run prisma:migrate`
5. Start the app with `npm run dev`

## Using Supabase

This project works well with Supabase because it already uses Prisma with PostgreSQL.

1. Create a Supabase project
2. In Supabase, open `Connect` and copy:
   - the pooled connection string for app runtime
   - the direct connection string for Prisma migrations
3. Put them in `.env`:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-flash-lite-latest"
```

4. Generate the Prisma client:

```bash
npm run prisma:generate
```

5. Run migrations against Supabase:

```bash
npm run prisma:migrate
```

6. Start the app:

```bash
npm run dev
```

`DATABASE_URL` is used by the app at runtime. `DIRECT_URL` is used by Prisma for schema changes and migrations.

See [docs/supabase-setup.md](docs/supabase-setup.md) for a more complete setup flow.

## Core API

- `GET, POST /api/positions`
- `GET, PATCH, DELETE /api/positions/:id`
- `POST /api/positions/:id/competencies`
- `GET, POST /api/competencies`
- `GET, PATCH, DELETE /api/competencies/:id`
