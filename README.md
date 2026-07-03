# Cursor Credits Redeem Lookup

Minimal Next.js app for workshop credit redemption. Participants enter their email to retrieve a randomly assigned redeem link. Admin uploads CSV lists and runs assignment.

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **Settings → API Keys → Publishable and secret API keys** and copy your **secret key** (`sb_secret_...`)
3. Open **SQL Editor** and run the migration in [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL (Settings → API) |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_...`, server-only — replaces legacy `service_role` key) |
| `ADMIN_PASSWORD` | Password for `/admin` login |

Legacy env vars still work during migration: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Run

```bash
npm install
npm run dev
```

- Public lookup: [http://localhost:3000](http://localhost:3000)
- Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Admin workflow

1. Sign in at `/admin` with your `ADMIN_PASSWORD`
2. Upload **credit links CSV** — one URL per row
3. Upload **participants CSV** — one email per row
4. Click **Run assignment** — randomly pairs unassigned emails with available links (1:1, no repeats)
5. Monitor stats and recent redemptions on the dashboard

## CSV format

Header row is optional. Single column per file.

**credits.csv**

```csv
url
https://cursor.com/redeem/abc123
https://cursor.com/redeem/def456
```

**participants.csv**

```csv
email
alice@example.com
bob@example.com
```

Duplicates are skipped on upload. Assignment fails if there are more unassigned emails than available links.

## User flow

1. User enters email on the home page
2. If email is registered and assigned → redeem link shown with copy button
3. If registered but not yet assigned → "Your credit is being prepared"
4. If not found → generic message (no email enumeration)
5. Each successful lookup is logged in `redemption_logs`

## Database tables

| Table | Purpose |
|---|---|
| `credit_links` | Pool of redeem URLs |
| `participants` | Emails with optional assigned link |
| `redemption_logs` | Audit trail for lookups |

All tables have RLS enabled with no public policies. Access is server-only via the secret key (`SUPABASE_SECRET_KEY`).

## Deploy

Works on Vercel or any Node.js host. Set the same env vars in your deployment settings.
