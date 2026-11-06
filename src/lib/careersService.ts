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

export const DEFAULT_VACANCIES: JobVacancy[] = [
  {
    id: "vac-consultant",
    title: "Ayurvedic Consultant (Vaidya)",
    department: "Clinical & Consultation",
    location: "Pilani, Rajasthan",
    type: "Full-time",
    experience: "3+ Years",
    description: "Conduct patient consultations, clinical examinations, Nadi Pariksha, and prescribe classical Ayurvedic medicines and Panchakarma therapies.",
    requirements: "• BAMS / MD (Ayurveda) from a recognized university.\n• Valid state Ayurvedic medical council registration.\n• Deep knowledge of classical Ayurvedic texts and pulse diagnosis.\n• Compassionate patient care and excellent consultation communication.",
    salaryRange: "Best in industry based on experience",
    applyEmail: "careers@charakayurvedapilani.com",
    active: true,
    displayOrder: 1,
    createdAt: "2026-11-05T00:00:00.000Z",
    updatedAt: "2026-11-05T00:00:00.000Z",
  },
  {
    id: "vac-pharmacist",
    title: "Ayurvedic Pharmacist",
    department: "Dispensary & Pharmacy",
    location: "Pilani, Rajasthan",
    type: "Full-time",
    experience: "1-3 Years",
    description: "Manage hospital dispensary, dispense classical Ayurvedic medicines, herbal decoctions, oils, maintain medicine stock records, and guide patients on dosage.",
    requirements: "• D.Pharm / B.Pharm in Ayurveda or certified pharmacy qualification.\n• Understanding of classical Ayurvedic formulations and herbal ingredients.\n• Good inventory management and record-keeping skills.\n• Courteous patient communication.",
    salaryRange: "Competitive salary + incentives",
    applyEmail: "careers@charakayurvedapilani.com",
    active: true,
    displayOrder: 2,
    createdAt: "2026-11-05T00:00:00.000Z",
    updatedAt: "2026-11-05T00:00:00.000Z",
  },
  {
    id: "vac-panchakarma-therapist",
    title: "Panchakarma Therapist (Male & Female)",
    department: "Panchakarma & Wellness",
    location: "Pilani, Rajasthan",
    type: "Full-time",
    experience: "1-2+ Years",
    description: "Administer traditional Panchakarma therapies including Abhyanga, Shirodhara, Swedana, Patra Pinda Sweda, Janu Basti, and Nasya under medical supervision.",
    requirements: "• Certified Panchakarma Technician / Therapist diploma or certificate.\n• Hands-on practical knowledge of authentic Kerala and classical therapies.\n• Dedication to hygiene, cleanliness, and patient comfort.\n• Professional etiquette and physical stamina.",
    salaryRange: "Competitive pay + accommodation support",
    applyEmail: "careers@charakayurvedapilani.com",
    active: true,
    displayOrder: 3,
    createdAt: "2026-11-05T00:00:00.000Z",
    updatedAt: "2026-11-05T00:00:00.000Z",
  },
  {
    id: "vac-nursing-staff",
    title: "Nursing Staff / Staff Nurse",
    department: "In-Patient & Clinical Care",
    location: "Pilani, Rajasthan",
    type: "Full-time",
    experience: "1-3 Years",
    description: "Oversee patient care in therapy and recovery rooms, monitor vital signs, prepare patients for procedures, administer oral treatments, and coordinate with attending Vaidyas.",
    requirements: "• GNM / B.Sc Nursing qualification.\n• Registered Nurse with clinical hospital experience.\n• Sound clinical judgement, emergency handling, and empathetic bedside manner.\n• Willingness to learn Ayurvedic clinical care protocols.",
    salaryRange: "Best in industry based on merit",
    applyEmail: "careers@charakayurvedapilani.com",
    active: true,
    displayOrder: 4,
    createdAt: "2026-11-05T00:00:00.000Z",
    updatedAt: "2026-11-05T00:00:00.000Z",
  },
  {
    id: "vac-mts",
    title: "MTS (Multi-Tasking Staff / Hospital Attendant)",
    department: "Hospital Support & Operations",
    location: "Pilani, Rajasthan",
    type: "Full-time",
    experience: "Fresher / 1+ Year",
    description: "Support general hospital operations, therapy room cleaning and setup, patient assistance, linen management, and assist hospital staff in daily operational tasks.",
    requirements: "• 10th or 12th pass.\n• Hardworking, disciplined, honest, and respectful.\n• Ability to handle multiple assistance tasks in a medical setting.\n• Good cooperative nature with staff and visitors.",
    salaryRange: "Standard hospital pay scale",
    applyEmail: "careers@charakayurvedapilani.com",
    active: true,
    displayOrder: 5,
    createdAt: "2026-11-05T00:00:00.000Z",
    updatedAt: "2026-11-05T00:00:00.000Z",
  },
  {
    id: "vac-receptionist",
    title: "Receptionist / Front Desk Executive",
    department: "Front Office & Administration",
    location: "Pilani, Rajasthan",
    type: "Full-time",
    experience: "1-2 Years",
    description: "Manage hospital front desk, welcome visiting patients, coordinate appointment schedules, attend patient phone inquiries and WhatsApp messages, and manage billing entries.",
    requirements: "• Graduate or 10+2 with proven front office / reception experience.\n• Fluent and polite communication in Hindi and basic English.\n• Computer literacy (MS Excel, Email, basic billing software).\n• Professional presentation and organized work ethic.",
    salaryRange: "Attractive salary package",
    applyEmail: "careers@charakayurvedapilani.com",
    active: true,
    displayOrder: 6,
    createdAt: "2026-11-05T00:00:00.000Z",
    updatedAt: "2026-11-05T00:00:00.000Z",
  },
  {
    id: "vac-security-guard",
    title: "Security Guard",
    department: "Facility Security & Safety",
    location: "Pilani, Rajasthan",
    type: "Full-time (Rotational)",
    experience: "1+ Year",
    description: "Safeguard hospital premises, monitor visitor entry/exit, assist elderly patients at the gate, manage vehicle parking, and ensure peaceful environment throughout hospital hours.",
    requirements: "• Prior experience as a security guard in hospital, school, or corporate facility.\n• Physically fit, alert, polite, and disciplined.\n• Clean background with no criminal record.\n• Punctuality and vigilance.",
    salaryRange: "Fixed monthly salary",
    applyEmail: "careers@charakayurvedapilani.com",
    active: true,
    displayOrder: 7,
    createdAt: "2026-11-05T00:00:00.000Z",
    updatedAt: "2026-11-05T00:00:00.000Z",
  },
  {
    id: "vac-cook",
    title: "Cook (Ayurvedic Dietary & Hospital Kitchen)",
    department: "Hospital Kitchen & Dietary",
    location: "Pilani, Rajasthan",
    type: "Full-time",
    experience: "1-3 Years",
    description: "Prepare fresh, nutritious Satvik Ayurvedic meals, herbal teas, gruels (kanji/peya), and dietary foods strictly according to physician prescriptions for residential patients.",
    requirements: "• Experience in Satvik / vegetarian cooking in hospitals, retreats, or ashrams.\n• High standards of personal and kitchen cleanliness and food hygiene.\n• Knowledge of preparing light, digestive, wholesome Ayurvedic dishes.\n• Reliable and dedicated.",
    salaryRange: "Competitive salary + meals provided",
    applyEmail: "careers@charakayurvedapilani.com",
    active: true,
    displayOrder: 8,
    createdAt: "2026-11-05T00:00:00.000Z",
    updatedAt: "2026-11-05T00:00:00.000Z",
  },
];

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
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("job_vacancies")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_VACANCIES.filter((v) => v.active);
    }
    return data.map(mapRow);
  } catch {
    return DEFAULT_VACANCIES.filter((v) => v.active);
  }
}

// ─── Admin (authenticated) ────────────────────────────────────────────────────

/** Fetch ALL vacancies (including inactive) – used in admin panel */
export async function fetchAdminVacancies(): Promise<JobVacancy[]> {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("job_vacancies")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_VACANCIES;
    }
    return data.map(mapRow);
  } catch {
    return DEFAULT_VACANCIES;
  }
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
