import { createClient } from "@/utils/supabase/client";

// job_vacancies is not yet in the auto-generated Database type;
// cast to any so the new table can be accessed without TS errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(): any {
  return createClient();
}

export interface JobVacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements?: string | null;
  salaryRange?: string | null;
  applyEmail?: string | null;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobVacancyInput {
  title: string;
  department: string;
  location?: string;
  type?: string;
  experience?: string;
  description: string;
  requirements?: string;
  salaryRange?: string;
  applyEmail?: string;
  active?: boolean;
  displayOrder?: number;
}

// ─── mapper ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): JobVacancy {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    location: row.location,
    type: row.type,
    experience: row.experience,
    description: row.description,
    requirements: row.requirements ?? null,
    salaryRange: row.salary_range ?? null,
    applyEmail: row.apply_email ?? null,
    active: row.active,
    displayOrder: row.display_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Public (anon) ───────────────────────────────────────────────────────────

/** Fetch only active vacancies – used on the public /careers page */
export async function fetchActiveVacancies(): Promise<JobVacancy[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("job_vacancies")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

// ─── Admin (authenticated) ────────────────────────────────────────────────────

/** Fetch ALL vacancies (including inactive) – used in admin panel */
export async function fetchAdminVacancies(): Promise<JobVacancy[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("job_vacancies")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createVacancy(input: CreateJobVacancyInput): Promise<JobVacancy> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("job_vacancies")
    .insert({
      title: input.title,
      department: input.department,
      location: input.location ?? "Pilani, Rajasthan",
      type: input.type ?? "Full-time",
      experience: input.experience ?? "Fresher",
      description: input.description,
      requirements: input.requirements ?? null,
      salary_range: input.salaryRange ?? null,
      apply_email: input.applyEmail ?? null,
      active: input.active ?? true,
      display_order: input.displayOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateVacancy(
  id: string,
  input: Partial<CreateJobVacancyInput>
): Promise<JobVacancy> {
  const supabase = getClient();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.department !== undefined) patch.department = input.department;
  if (input.location !== undefined) patch.location = input.location;
  if (input.type !== undefined) patch.type = input.type;
  if (input.experience !== undefined) patch.experience = input.experience;
  if (input.description !== undefined) patch.description = input.description;
  if (input.requirements !== undefined) patch.requirements = input.requirements;
  if (input.salaryRange !== undefined) patch.salary_range = input.salaryRange;
  if (input.applyEmail !== undefined) patch.apply_email = input.applyEmail;
  if (input.active !== undefined) patch.active = input.active;
  if (input.displayOrder !== undefined) patch.display_order = input.displayOrder;

  const { data, error } = await supabase
    .from("job_vacancies")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deleteVacancy(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from("job_vacancies").delete().eq("id", id);
  if (error) throw error;
}

// ─── Realtime subscription helper ────────────────────────────────────────────

const EVENT_NAME = "charak_vacancies_updated";

export function subscribeVacancies(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export function notifyVacanciesUpdated() {
  window.dispatchEvent(new Event(EVENT_NAME));
}
