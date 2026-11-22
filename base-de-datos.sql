-- ACETEC: pega todo esto en Supabase → SQL Editor → New query → Run

create table if not exists public.servicios (
  id          text primary key,
  data        jsonb  not null,
  updated_at  bigint not null default 0,
  borrado     boolean not null default false,
  modificado  timestamptz not null default now()
);

create table if not exists public.config (
  id          text primary key,
  data        jsonb  not null,
  updated_at  bigint not null default 0,
  modificado  timestamptz not null default now()
);

-- Marca la hora del servidor en cada cambio (así cada equipo sabe qué bajar).
create or replace function public.marcar_modificado() returns trigger
language plpgsql as $$
begin
  new.modificado := clock_timestamp();
  return new;
end $$;

drop trigger if exists t_servicios_mod on public.servicios;
create trigger t_servicios_mod before insert or update on public.servicios
  for each row execute function public.marcar_modificado();

drop trigger if exists t_config_mod on public.config;
create trigger t_config_mod before insert or update on public.config
  for each row execute function public.marcar_modificado();

create index if not exists servicios_modificado_idx on public.servicios (modificado);

-- Seguridad: solo los correos autorizados por ACETEC pueden ver o cambiar datos.
create table if not exists public.permitidos (email text primary key);

create or replace function public.es_del_equipo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.permitidos where email = lower(auth.jwt() ->> 'email'));
$$;

alter table public.servicios  enable row level security;
alter table public.config     enable row level security;
alter table public.permitidos enable row level security;

drop policy if exists "equipo acetec" on public.servicios;
create policy "equipo acetec" on public.servicios for all to authenticated
  using (public.es_del_equipo()) with check (public.es_del_equipo());

drop policy if exists "equipo acetec" on public.config;
create policy "equipo acetec" on public.config for all to authenticated
  using (public.es_del_equipo()) with check (public.es_del_equipo());

drop policy if exists "equipo acetec" on public.permitidos;
create policy "equipo acetec" on public.permitidos for all to authenticated
  using (public.es_del_equipo()) with check (public.es_del_equipo());

-- 👇 CAMBIA este correo por el de Jorge (el primer usuario). Los demás se agregan desde la app.
insert into public.permitidos (email) values (lower('CORREO_DE_JORGE@gmail.com'))
  on conflict do nothing;
