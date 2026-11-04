-- ============================================================
-- Careers / Job Vacancies
-- ============================================================

create table if not exists public.job_vacancies (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  department   text not null,
  location     text not null default 'Pilani, Rajasthan',
  type         text not null default 'Full-time',   -- Full-time | Part-time | Contract | Internship
  experience   text not null default 'Fresher',
  description  text not null,
  requirements text,                                -- plain text or markdown list
  salary_range text,                                -- e.g. "₹15,000 – ₹25,000 / month"
  apply_email  text,                                -- optional dedicated apply email
  active       boolean not null default true,
  display_order integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Keep updated_at current automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists job_vacancies_updated_at on public.job_vacancies;
create trigger job_vacancies_updated_at
  before update on public.job_vacancies
  for each row execute function public.set_updated_at();

-- RLS
alter table public.job_vacancies enable row level security;

-- Public read: only active listings
create policy "Public can view active vacancies"
  on public.job_vacancies for select
  to anon, authenticated
  using (active = true);

-- Authenticated admin can do everything
create policy "Authenticated admin full access"
  on public.job_vacancies for all
  to authenticated
  using (true)
  with check (true);

-- Expose to REST API
grant select on public.job_vacancies to anon;
grant all    on public.job_vacancies to authenticated;

-- Seed a sample vacancy so the page isn't empty on first visit
insert into public.job_vacancies
  (title, department, location, type, experience, description, requirements, salary_range, apply_email, active, display_order)
values
  (
    'Ayurvedic Doctor (BAMS)',
    'Medical',
    'Pilani, Rajasthan',
    'Full-time',
    '1–3 Years',
    'We are looking for a passionate BAMS-qualified Ayurvedic Doctor to join our clinical team at Charak Ayurveda, Pilani. You will conduct patient consultations, diagnose using Dosha theory, prescribe classical medicines, and supervise Panchakarma therapies.',
    '• BAMS degree from a recognised university\n• Valid registration with Rajasthan Ayurved Council\n• Good communication skills in Hindi and English\n• Willingness to work in a team-focused hospital environment',
    '₹20,000 – ₹35,000 / month',
    'careers@charakayurvedapilani.com',
    true,
    1
  );
