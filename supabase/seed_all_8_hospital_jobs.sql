-- ========================================================================
-- Charak Ayurveda: Create Table & Seed All 8 Hospital Roles
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- ========================================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.job_vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'Pilani, Rajasthan',
    type TEXT NOT NULL DEFAULT 'Full-time',
    experience TEXT NOT NULL DEFAULT 'Fresher',
    description TEXT NOT NULL,
    requirements TEXT,
    salary_range TEXT,
    apply_email TEXT DEFAULT 'careers@charakayurvedapilani.com',
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.job_vacancies ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Public can view active vacancies" ON public.job_vacancies;
CREATE POLICY "Public can view active vacancies"
    ON public.job_vacancies FOR SELECT
    TO anon, authenticated
    USING (active = true);

DROP POLICY IF EXISTS "Authenticated admin full access" ON public.job_vacancies;
CREATE POLICY "Authenticated admin full access"
    ON public.job_vacancies FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Permissions
GRANT SELECT ON public.job_vacancies TO anon;
GRANT ALL ON public.job_vacancies TO authenticated;
GRANT ALL ON public.job_vacancies TO service_role;

-- 5. Clean up old sample vacancy if exists
DELETE FROM public.job_vacancies WHERE id = 'vac-consultant' OR title = 'Ayurvedic Doctor (BAMS)';

-- 6. Insert All 8 Official Hospital Job Openings
INSERT INTO public.job_vacancies (
    title,
    department,
    location,
    type,
    experience,
    description,
    requirements,
    salary_range,
    apply_email,
    active,
    display_order
) VALUES
(
    'Ayurvedic Consultant (Vaidya)',
    'Clinical & Consultation',
    'Pilani, Rajasthan',
    'Full-time',
    '3+ Years',
    'Conduct patient consultations, clinical examinations, Nadi Pariksha, and prescribe classical Ayurvedic medicines and Panchakarma therapies.',
    '• BAMS / MD (Ayurveda) from a recognized university.
• Valid state Ayurvedic medical council registration.
• Deep knowledge of classical Ayurvedic texts and pulse diagnosis.
• Compassionate patient care and excellent consultation communication.',
    'Best in industry based on experience',
    'careers@charakayurvedapilani.com',
    true,
    1
),
(
    'Ayurvedic Pharmacist',
    'Dispensary & Pharmacy',
    'Pilani, Rajasthan',
    'Full-time',
    '1-3 Years',
    'Manage hospital dispensary, dispense classical Ayurvedic medicines, herbal decoctions, oils, maintain medicine stock records, and guide patients on dosage.',
    '• D.Pharm / B.Pharm in Ayurveda or certified pharmacy qualification.
• Understanding of classical Ayurvedic formulations and herbal ingredients.
• Good inventory management and record-keeping skills.
• Courteous patient communication.',
    'Competitive salary + incentives',
    'careers@charakayurvedapilani.com',
    true,
    2
),
(
    'Panchakarma Therapist (Male & Female)',
    'Panchakarma & Wellness',
    'Pilani, Rajasthan',
    'Full-time',
    '1-2+ Years',
    'Administer traditional Panchakarma therapies including Abhyanga, Shirodhara, Swedana, Patra Pinda Sweda, Janu Basti, and Nasya under medical supervision.',
    '• Certified Panchakarma Technician / Therapist diploma or certificate.
• Hands-on practical knowledge of authentic Kerala and classical therapies.
• Dedication to hygiene, cleanliness, and patient comfort.
• Professional etiquette and physical stamina.',
    'Competitive pay + accommodation support',
    'careers@charakayurvedapilani.com',
    true,
    3
),
(
    'Nursing Staff / Staff Nurse',
    'In-Patient & Clinical Care',
    'Pilani, Rajasthan',
    'Full-time',
    '1-3 Years',
    'Oversee patient care in therapy and recovery rooms, monitor vital signs, prepare patients for procedures, administer oral treatments, and coordinate with attending Vaidyas.',
    '• GNM / B.Sc Nursing qualification.
• Registered Nurse with clinical hospital experience.
• Sound clinical judgement, emergency handling, and empathetic bedside manner.
• Willingness to learn Ayurvedic clinical care protocols.',
    'Best in industry based on merit',
    'careers@charakayurvedapilani.com',
    true,
    4
),
(
    'MTS (Multi-Tasking Staff / Hospital Attendant)',
    'Hospital Support & Operations',
    'Pilani, Rajasthan',
    'Full-time',
    'Fresher / 1+ Year',
    'Support general hospital operations, therapy room cleaning and setup, patient assistance, linen management, and assist clinic staff in daily operational tasks.',
    '• 10th or 12th pass.
• Hardworking, disciplined, honest, and respectful.
• Ability to handle multiple assistance tasks in a medical setting.
• Good cooperative nature with staff and visitors.',
    'Standard hospital pay scale',
    'careers@charakayurvedapilani.com',
    true,
    5
),
(
    'Receptionist / Front Desk Executive',
    'Front Office & Administration',
    'Pilani, Rajasthan',
    'Full-time',
    '1-2 Years',
    'Manage clinic front desk, welcome visiting patients, coordinate appointment schedules, attend patient phone inquiries and WhatsApp messages, and manage billing entries.',
    '• Graduate or 10+2 with proven front office / reception experience.
• Fluent and polite communication in Hindi and basic English.
• Computer literacy (MS Excel, Email, basic billing software).
• Professional presentation and organized work ethic.',
    'Attractive salary package',
    'careers@charakayurvedapilani.com',
    true,
    6
),
(
    'Security Guard',
    'Facility Security & Safety',
    'Pilani, Rajasthan',
    'Full-time (Rotational)',
    '1+ Year',
    'Safeguard hospital premises, monitor visitor entry/exit, assist elderly patients at the gate, manage vehicle parking, and ensure peaceful environment throughout clinic hours.',
    '• Prior experience as a security guard in hospital, school, or corporate facility.
• Physically fit, alert, polite, and disciplined.
• Clean background with no criminal record.
• Punctuality and vigilance.',
    'Fixed monthly salary',
    'careers@charakayurvedapilani.com',
    true,
    7
),
(
    'Cook (Ayurvedic Dietary & Hospital Kitchen)',
    'Hospital Kitchen & Dietary',
    'Pilani, Rajasthan',
    'Full-time',
    '1-3 Years',
    'Prepare fresh, nutritious Satvik Ayurvedic meals, herbal teas, gruels (kanji/peya), and dietary foods strictly according to physician prescriptions for residential patients.',
    '• Experience in Satvik / vegetarian cooking in hospitals, retreats, or ashrams.
• High standards of personal and kitchen cleanliness and food hygiene.
• Knowledge of preparing light, digestive, wholesome Ayurvedic dishes.
• Reliable and dedicated.',
    'Competitive salary + meals provided',
    'careers@charakayurvedapilani.com',
    true,
    8
);
