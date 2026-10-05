# Operations

Local history still sits in `prisma/dev.db`. Production uses PostgreSQL. The SQLite migration files are archived in `prisma/migrations-sqlite` and are not applied to Postgres. Do not copy development secrets into production. The values still needed from the owner are listed in `docs/PRODUCTION.md`. Do not point a live store at `prisma/dev.db`, and do not run a reset against either database.

## Backup

Stop writes if you can. Copy `prisma/dev.db` to a dated file outside the repository. The file is gitignored. Do not commit it.

## Restore

Replace `prisma/dev.db` with the backup only after stopping the app. Then run `npx prisma generate`. Do not run a reset.

## Migrations

Production applies `prisma/migrations` with `npx prisma migrate deploy`. That command is part of the Vercel build. Do not run `prisma migrate reset` on a database that holds orders. The archived SQLite migrations are not part of that history.

## Environments

Development, test, and production each need their own `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `EMAIL_PROVIDER` credentials, and `META_ACCESS_TOKEN`. Names live in `.env.example`. Values stay in untracked `.env` or `.env.local`.
