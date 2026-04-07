# Supabase Setup

This repo can use Supabase as its main database without changing the app architecture.

## What we use Supabase for

- Postgres database for Prisma models
- Optional file storage for evidence uploads later
- Optional vector search later if you add RAG

The current app still uses `NextAuth` for authentication, so you do not need to switch to Supabase Auth now.

## Step 1: Create a Supabase project

Create a new project in Supabase, then open the `Connect` dialog in your project dashboard.

You will need two connection strings:

- A pooled connection string for app runtime
- A direct connection string for Prisma migrations

## Step 2: Configure `.env`

Create `.env` from `.env.example` and fill in your real values:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

Notes:

- `DATABASE_URL` is the pooled runtime connection string
- `DIRECT_URL` is the direct connection used for Prisma migrations
- `?pgbouncer=true` helps Prisma work correctly with Supabase pooling

## Step 3: Install and generate Prisma

```bash
npm install
npm run prisma:generate
```

## Step 4: Push schema to Supabase

If this is a fresh database:

```bash
npm run prisma:migrate
```

If you already have a database and want to inspect it first, use Prisma introspection before changing schema.

## Step 5: Start local app

```bash
npm run dev
```

## Recommended next steps for this project

After the database is connected, build in this order:

1. Seed sample `Position` and `Competency` records
2. Add `Evidence` records for employee observations
3. Add AI evaluation endpoint for `Report`
4. Add file upload with Supabase Storage
5. Add RAG only when you have long documents to search

## Important design advice

- Keep core competency data in Postgres tables
- Use RAG only for long supporting documents
- Do not rely on the model to "remember" your competency framework by itself
- Always send the exact position competencies and employee evidence into the evaluation prompt

## References

- Supabase Prisma guide: https://supabase.com/docs/guides/database/prisma
- Prisma Supabase guide: https://www.prisma.io/docs/v6/orm/overview/databases/supabase
