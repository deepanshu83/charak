-- ========================================================================
-- Seed Initial 8 Job Vacancies for Charak Ayurveda Hospital
-- Positions: Consultant, Pharmacist, Panchakarma Therapist, Nursing Staff,
--            MTS, Receptionist, Security Guard, Cook
-- ========================================================================

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
