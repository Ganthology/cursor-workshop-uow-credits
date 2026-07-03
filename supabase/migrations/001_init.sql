-- Credit links pool
create table credit_links (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  is_assigned boolean not null default false,
  created_at timestamptz not null default now()
);

-- Participant emails with optional assigned credit
create table participants (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  credit_link_id uuid unique references credit_links(id) on delete set null,
  assigned_at timestamptz,
  created_at timestamptz not null default now()
);

-- Audit log for lookups
create table redemption_logs (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  credit_link_id uuid references credit_links(id) on delete set null,
  link_url text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index participants_email_idx on participants (email);
create index redemption_logs_email_idx on redemption_logs (email);
create index redemption_logs_created_at_idx on redemption_logs (created_at desc);

-- RLS enabled, no public policies — all access via service role
alter table credit_links enable row level security;
alter table participants enable row level security;
alter table redemption_logs enable row level security;
