create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

-- first signup becomes admin
create or replace function public.handle_first_admin() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_first_admin after insert on auth.users for each row execute function public.handle_first_admin();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name_en text not null, name_ar text not null,
  description_en text not null default '', description_ar text not null default '',
  price numeric(10,2) not null check (price >= 0),
  duration_min int not null default 30,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "public read active services" on public.services for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admin manage services" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null, name_ar text not null,
  active boolean not null default true,
  sort int not null default 0
);
grant select on public.barbers to anon, authenticated;
grant all on public.barbers to service_role;
alter table public.barbers enable row level security;
create policy "public read barbers" on public.barbers for select to anon, authenticated using (true);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  service_id uuid not null references public.services(id),
  barber_id uuid not null references public.barbers(id),
  appt_date date not null,
  appt_time time not null,
  status text not null default 'confirmed' check (status in ('confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);
create unique index appointments_no_double on public.appointments(barber_id, appt_date, appt_time) where status <> 'cancelled';
grant select, update, delete on public.appointments to authenticated;
grant all on public.appointments to service_role;
alter table public.appointments enable row level security;
create policy "admin all appointments" on public.appointments for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.get_booked_slots(_barber uuid, _date date) returns setof time language sql stable security definer set search_path = public as $$
  select appt_time from public.appointments where barber_id=_barber and appt_date=_date and status<>'cancelled'
$$;
grant execute on function public.get_booked_slots(uuid, date) to anon, authenticated;

create or replace function public.book_appointment(_name text, _phone text, _service uuid, _barber uuid, _date date, _time time) returns uuid language plpgsql security definer set search_path = public as $$
declare _id uuid;
begin
  if char_length(trim(_name)) < 2 or char_length(_name) > 100 then raise exception 'invalid_name'; end if;
  if _phone !~ '^\+?[0-9 ()-]{7,20}$' then raise exception 'invalid_phone'; end if;
  if (_date + _time) < (now() at time zone 'Asia/Amman') then raise exception 'past_slot'; end if;
  if not exists (select 1 from services where id=_service and active) then raise exception 'invalid_service'; end if;
  if not exists (select 1 from barbers where id=_barber and active) then raise exception 'invalid_barber'; end if;
  begin
    insert into appointments(customer_name, phone, service_id, barber_id, appt_date, appt_time)
    values (trim(_name), trim(_phone), _service, _barber, _date, _time) returning id into _id;
  exception when unique_violation then raise exception 'slot_taken';
  end;
  return _id;
end $$;
grant execute on function public.book_appointment(text,text,uuid,uuid,date,time) to anon, authenticated;

insert into public.services(name_en,name_ar,description_en,description_ar,price,duration_min,sort) values
('Signature Cut','القصة المميزة','Consultation, precision cut, wash and styling.','استشارة، قص دقيق، غسيل وتصفيف.',15,45,1),
('Skin Fade','تدريج على الصفر','Seamless fade finished with a razor line-up.','تدريج ناعم مع تحديد بالموس.',12,40,2),
('Beard Sculpt','تشكيل اللحية','Shape, trim and hot-towel finish with oils.','تشكيل وتهذيب مع منشفة ساخنة وزيوت.',8,25,3),
('Royal Shave','الحلاقة الملكية','Traditional straight-razor shave with hot towels.','حلاقة تقليدية بالموس مع مناشف ساخنة.',10,30,4),
('The Black Blade Ritual','طقوس بلاك بليد','Cut, beard, facial mask and scalp massage.','قص، لحية، ماسك للوجه وتدليك للرأس.',30,90,5),
('Kids Cut','قصة الأطفال','Clean, classic cuts for under 12s.','قصات كلاسيكية للأطفال دون 12 سنة.',7,30,6);

insert into public.barbers(slug,name_en,name_ar,sort) values
('omar','Omar Haddad','عمر حداد',1),
('karim','Karim Nasser','كريم ناصر',2),
('yousef','Yousef Saleh','يوسف صالح',3);