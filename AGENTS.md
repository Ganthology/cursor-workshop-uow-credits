<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- Use Supabase latest API key naming: `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (publishable/secret keys); check official docs before implementing Supabase integrations.
- Prefer minimalist Cursor dark-theme UI (`#0a0a0a` background, `#007acc` accent) for this project.
- Do not edit attached plan files when implementing a plan.
- Do not recreate todos when plan todos already exist; mark existing ones in_progress and complete them.
- Do not git commit or push without explicit user permission.

## Learned Workspace Facts

- Next.js 15 App Router credits redeem lookup app for a UoW workshop; public lookup at `/`, admin dashboard at `/admin`.
- Supabase Postgres backend with tables `credit_links`, `participants`, and `redemption_logs`; schema in `supabase/migrations/001_init.sql`.
- Server-only Supabase access via secret key in `lib/supabase/server.ts`; legacy `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` env vars still supported as fallbacks.
- Admin routes protected by `ADMIN_PASSWORD` env var with cookie session middleware.
- Admin uploads CSV lists of credit links and participant emails, then runs Fisher-Yates random 1:1 assignment (no repeats).
- Public email lookup returns assigned redeem link, logs to `redemption_logs`, and rate-limits repeat lookups per email.
- Home page includes a `CommunitySlides` carousel: tag @cursor.my on Instagram, join Cursor Malaysia WhatsApp, and rgbk.club/links as the last slide.
