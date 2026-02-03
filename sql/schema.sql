-- Helva Cloud: OpenClaw usage tracking schema

create table if not exists usage_events (
  id bigserial primary key,
  ts timestamptz not null,
  provider text not null,
  model text not null,
  input_tokens integer not null,
  output_tokens integer not null,
  total_tokens integer not null,
  cost_total numeric null,
  session_id text not null,
  message_id text not null,
  latency_ms integer null,
  created_at timestamptz not null default now(),
  unique (session_id, message_id)
);

create index if not exists usage_events_ts_idx on usage_events (ts);
create index if not exists usage_events_model_idx on usage_events (model);
