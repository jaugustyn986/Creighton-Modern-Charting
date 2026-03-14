-- Initial schema scaffold for Well Within

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists couples (
  id uuid primary key,
  partner_a uuid references users(id),
  partner_b uuid references users(id),
  invite_state text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists cycles (
  id uuid primary key,
  user_id uuid references users(id) not null,
  starts_on date not null,
  version integer not null default 1,
  created_at timestamptz default now()
);

create table if not exists daily_entries (
  id uuid primary key,
  cycle_id uuid references cycles(id) not null,
  entry_date date not null,
  bleeding text not null,
  sensation text,
  appearance text,
  quantity text,
  intercourse boolean default false,
  notes text,
  raw_payload jsonb,
  computed_rank integer,
  computed_phase text,
  version integer not null default 1,
  created_at timestamptz default now()
);
