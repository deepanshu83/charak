-- ============================================================================
-- Charak Ayurveda Hospital - Seed Data
-- Reproducible SQL Seed for Initial MVP Data
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DOCTORS (3 records)
-- ----------------------------------------------------------------------------
INSERT INTO public.doctors (
  id, name, specialization, qualification, experience, bio, detailed_bio, image, active
) VALUES
(
  'd0c00000-0000-4000-a000-000000000001',
  'Dr. Varij Pandey',
  'Orthopaedic Care',
  'B.A.M.S., M.D. (Ayurveda)',
  '15 Years',
  'Senior Ayurvedic Orthopaedic Specialist with 15 years of clinical expertise in spine and joint disorders, musculoskeletal rehabilitation, and classical bone & joint care.',
  'Dr. Varij Pandey is a senior Ayurvedic physician with 15 years of dedicated practice in orthopaedic care. He specializes in spine and joint disorders, sciatica, cervical spondylitis, slip disc, and chronic arthritis through classical Panchakarma and targeted Ayurvedic therapies.\n\nAvailability: Sunday\nTimings: 9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM',
  '/images/g1.jpg',
  true
),
(
  'd0c00000-0000-4000-a000-000000000002',
  'Dr. Anuja Singhai',
  'Gynaecology & Fertility, PCOS/PCOD',
  'B.A.M.S., M.D. (Ayurveda)',
  '15 Years',
  'Senior Ayurvedic Gynaecologist with 15 years of clinical excellence in women''s health, PCOS/PCOD, irregular and painful cycles, and natural fertility.',
  'Dr. Anuja Singhai brings 15 years of specialized Ayurvedic clinical experience in female reproductive health, hormonal equilibrium, PCOS/PCOD, infertility, and tubal blockages. Her gentle, root-cause methodology combines classical Uttar Basti, rasayanas, and supportive lifestyle guidance.\n\nAvailability: Daily\nTimings: 4:00 PM – 7:00 PM',
  '/images/g2.jpg',
  true
),
(
  'd0c00000-0000-4000-a000-000000000003',
  'Dr. Ramraj Sharma',
  'Panchakarma, Lifestyle Disorders',
  'B.A.M.S., PGTDIP',
  '3+ Years',
  'Ayurvedic Physician with 3+ years of experience specializing in authentic Panchakarma therapies, holistic detoxification, and metabolic lifestyle disorder management.',
  'Dr. Ramraj Sharma is an accomplished Ayurvedic physician and Panchakarma practitioner. He focuses on comprehensive body cleansing, digestive disorders, insomnia, stress management, and metabolic diseases through classical therapies and patient-centered dinacharya protocols.\n\nAvailability: Daily\nTimings: 9:00 AM – 1:00 PM | 4:00 PM – 7:00 PM',
  '/images/g3.jpg',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  specialization = EXCLUDED.specialization,
  qualification = EXCLUDED.qualification,
  experience = EXCLUDED.experience,
  bio = EXCLUDED.bio,
  detailed_bio = EXCLUDED.detailed_bio,
  image = EXCLUDED.image,
  active = EXCLUDED.active,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 2. DOCTOR AVAILABILITY
-- ----------------------------------------------------------------------------
INSERT INTO public.doctor_availability (
  id, doctor_id, day_of_week, start_time, end_time, slot_duration, active
) VALUES
-- Dr. Varij Pandey availability (Sunday only: 9am-1pm, 4pm-7pm)
('a0000001-0000-4000-a000-000000000001', 'd0c00000-0000-4000-a000-000000000001', 'Sunday', '09:00:00', '13:00:00', 30, true),
('a0000001-0000-4000-a000-000000000002', 'd0c00000-0000-4000-a000-000000000001', 'Sunday', '16:00:00', '19:00:00', 30, true),

-- Dr. Anuja Singhai availability (Daily: 4pm-7pm)
('a0000002-0000-4000-a000-000000000001', 'd0c00000-0000-4000-a000-000000000002', 'Monday', '16:00:00', '19:00:00', 30, true),
('a0000002-0000-4000-a000-000000000002', 'd0c00000-0000-4000-a000-000000000002', 'Tuesday', '16:00:00', '19:00:00', 30, true),
('a0000002-0000-4000-a000-000000000003', 'd0c00000-0000-4000-a000-000000000002', 'Wednesday', '16:00:00', '19:00:00', 30, true),
('a0000002-0000-4000-a000-000000000004', 'd0c00000-0000-4000-a000-000000000002', 'Thursday', '16:00:00', '19:00:00', 30, true),
('a0000002-0000-4000-a000-000000000005', 'd0c00000-0000-4000-a000-000000000002', 'Friday', '16:00:00', '19:00:00', 30, true),
('a0000002-0000-4000-a000-000000000006', 'd0c00000-0000-4000-a000-000000000002', 'Saturday', '16:00:00', '19:00:00', 30, true),
('a0000002-0000-4000-a000-000000000007', 'd0c00000-0000-4000-a000-000000000002', 'Sunday', '16:00:00', '19:00:00', 30, true),

-- Dr. Ramraj Sharma availability (Daily: 9am-1pm, 4pm-7pm)
('a0000003-0000-4000-a000-000000000001', 'd0c00000-0000-4000-a000-000000000003', 'Monday', '09:00:00', '13:00:00', 30, true),
('a0000003-0000-4000-a000-000000000002', 'd0c00000-0000-4000-a000-000000000003', 'Monday', '16:00:00', '19:00:00', 30, true),
('a0000003-0000-4000-a000-000000000003', 'd0c00000-0000-4000-a000-000000000003', 'Tuesday', '09:00:00', '13:00:00', 30, true),
('a0000003-0000-4000-a000-000000000004', 'd0c00000-0000-4000-a000-000000000003', 'Tuesday', '16:00:00', '19:00:00', 30, true),
('a0000003-0000-4000-a000-000000000005', 'd0c00000-0000-4000-a000-000000000003', 'Wednesday', '09:00:00', '13:00:00', 30, true),
('a0000003-0000-4000-a000-000000000006', 'd0c00000-0000-4000-a000-000000000003', 'Wednesday', '16:00:00', '19:00:00', 30, true),
('a0000003-0000-4000-a000-000000000007', 'd0c00000-0000-4000-a000-000000000003', 'Thursday', '09:00:00', '13:00:00', 30, true),
('a0000003-0000-4000-a000-000000000008', 'd0c00000-0000-4000-a000-000000000003', 'Thursday', '16:00:00', '19:00:00', 30, true),
('a0000003-0000-4000-a000-000000000009', 'd0c00000-0000-4000-a000-000000000003', 'Friday', '09:00:00', '13:00:00', 30, true),
('a0000003-0000-4000-a000-000000000010', 'd0c00000-0000-4000-a000-000000000003', 'Friday', '16:00:00', '19:00:00', 30, true),
('a0000003-0000-4000-a000-000000000011', 'd0c00000-0000-4000-a000-000000000003', 'Saturday', '09:00:00', '13:00:00', 30, true),
('a0000003-0000-4000-a000-000000000012', 'd0c00000-0000-4000-a000-000000000003', 'Saturday', '16:00:00', '19:00:00', 30, true),
('a0000003-0000-4000-a000-000000000013', 'd0c00000-0000-4000-a000-000000000003', 'Sunday', '09:00:00', '13:00:00', 30, true),
('a0000003-0000-4000-a000-000000000014', 'd0c00000-0000-4000-a000-000000000003', 'Sunday', '16:00:00', '19:00:00', 30, true)
ON CONFLICT (id) DO UPDATE SET
  doctor_id = EXCLUDED.doctor_id,
  day_of_week = EXCLUDED.day_of_week,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  slot_duration = EXCLUDED.slot_duration,
  active = EXCLUDED.active;

-- ----------------------------------------------------------------------------
-- 3. TREATMENTS (6 records)
-- ----------------------------------------------------------------------------
INSERT INTO public.treatments (
  id, name, slug, short_description, description, duration, price, image, active
) VALUES
(
  '70000000-0000-4000-a000-000000000001',
  'Therapies & Panchakarma',
  'therapies-panchakarma',
  'Panchakarma & Ayurvedic retreat (5 day / 7 day)',
  'Classical Panchakarma detoxification and intensive 5-day / 7-day Ayurvedic residential retreats to cleanse accumulated Ama, rejuvenate tissues, and restore lifelong vitality.',
  '60–90 min',
  2500.00,
  '/images/panchkaram.jpeg',
  true
),
(
  '70000000-0000-4000-a000-000000000002',
  'Body Pain & Spine Care',
  'body-pain-spine-care',
  'Back pain, Sciatica, Knee pain, Cervical spondylitis & Slip disc',
  'Targeted Ayurvedic treatments for back pain, sciatica, knee pain, neck & shoulder pain, cervical spondylitis, slip disc, frozen shoulder, and joint arthritis using authentic Basti and herbal oils.',
  '45 min',
  1200.00,
  '/images/joint.png',
  true
),
(
  '70000000-0000-4000-a000-000000000003',
  'Skin & Hair Care',
  'skin-hair-care',
  'Psoriasis, Eczema, Skin allergy, Acne, Hair fall & Vitiligo',
  'Root-cause Ayurvedic healing for psoriasis, eczema, skin allergies, acne & scars, fungal infections, hair fall, dandruff, and vitiligo via internal blood purification and herbal Lepa.',
  '45 min',
  1200.00,
  '/images/skincare.jpeg',
  true
),
(
  '70000000-0000-4000-a000-000000000004',
  'Women''s Health & Fertility',
  'womens-health-fertility',
  'PCOS, PCOD, Irregular & Painful periods, Infertility, Tubal block',
  'Holistic Ayurvedic care for PCOS, PCOD, irregular and painful menstrual cycles, natural fertility enhancement, and tubal blockages using specialized Uttar Basti and balancing rasayanas.',
  '45 min',
  1200.00,
  '/images/infertility.png',
  true
),
(
  '70000000-0000-4000-a000-000000000005',
  'Stomach & Digestion',
  'stomach-digestion',
  'Acidity, Gas, Constipation, IBS, Bloating, Piles & Fatty liver',
  'Re-igniting the digestive fire (Jatharagni) to effectively resolve acidity, gas, constipation, IBS, bloating, indigestion, piles, fissure, fistula, and fatty liver.',
  '45 min',
  1000.00,
  '/images/g5.jpg',
  true
),
(
  '70000000-0000-4000-a000-000000000006',
  'Stress & Lifestyle Management',
  'stress-lifestyle-management',
  'Insomnia, Stress & anxiety, Migraine, Obesity, Thyroid, Diabetes',
  'Comprehensive therapeutic protocols for insomnia, chronic stress, anxiety, migraine, obesity, thyroid dysfunction, and diabetes through Shirodhara, herbal Rasayanas, and Dinacharya.',
  '45 min',
  1000.00,
  '/images/g4.jpg',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  duration = EXCLUDED.duration,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  active = EXCLUDED.active,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 4. PRODUCTS (8 records)
-- ----------------------------------------------------------------------------
INSERT INTO public.products (
  id, name, slug, short_description, description, price, stock, category, image, active
) VALUES
(
  'e0000000-0000-4000-a000-000000000001',
  'Ashwagandha Rasayana',
  'ashwagandha-rasayana',
  'Daily adaptogenic support for strength and calm.',
  'A classical adaptogenic blend supporting stamina, rest, and everyday resilience through a balanced herbal formulation.',
  1499.00,
  24,
  'Herbal Formulation',
  '/images/g3.jpg',
  true
),
(
  'e0000000-0000-4000-a000-000000000002',
  'Triphala Digestive Support',
  'triphala-digestive-support',
  'Gentle digestive support for everyday comfort.',
  'A gentle three-fruit formulation traditionally used to support digestion, bowel regularity, and balanced gut function.',
  1299.00,
  18,
  'Wellness',
  '/images/g3.jpg',
  true
),
(
  'e0000000-0000-4000-a000-000000000003',
  'Medicated Sesame Oil',
  'medicated-sesame-oil',
  'Warm herbal oil for restorative massage.',
  'A warm, classical medicated sesame oil prepared for restorative massage and nourishment of the body.',
  1799.00,
  12,
  'Therapeutic Oil',
  '/images/g4.jpg',
  true
),
(
  'e0000000-0000-4000-a000-000000000004',
  'Panchakarma Detox Kit',
  'panchakarma-detox-kit',
  'A guided cleansing routine for seasonal renewal.',
  'A carefully structured home-care kit supporting a traditional cleansing routine with practitioner guidance.',
  3499.00,
  8,
  'Wellness',
  '/images/panchkaram.jpeg',
  true
),
(
  'e0000000-0000-4000-a000-000000000005',
  'Janu Basti Oil',
  'janu-basti-oil',
  'Targeted joint massage with classical herbs.',
  'A concentrated herbal oil for targeted knee and joint massage under classical Ayurvedic guidance.',
  1899.00,
  15,
  'Therapeutic Oil',
  '/images/joint.png',
  true
),
(
  'e0000000-0000-4000-a000-000000000006',
  'Amla Immunity Blend',
  'amla-immunity-blend',
  'Cooling Amla blend for everyday vitality.',
  'A cooling, vitamin-rich Amla blend for everyday immune support and general vitality.',
  999.00,
  0,
  'Herbal Formulation',
  '/images/skincare.jpeg',
  true
),
(
  'e0000000-0000-4000-a000-000000000007',
  'Neem & Manjistha Cleanser',
  'neem-manjistha-cleanser',
  'Traditional support for skin and blood balance.',
  'A balanced herbal cleanser traditionally used to support blood purification and healthy skin metabolism.',
  1199.00,
  22,
  'Wellness',
  '/images/g5.jpg',
  true
),
(
  'e0000000-0000-4000-a000-000000000008',
  'Brahmi Calm Tea',
  'brahmi-calm-tea',
  'A calming herbal tea for evening rituals.',
  'A soothing herbal tea with Brahmi and calming botanicals for mindful evening routines.',
  849.00,
  31,
  'Care',
  '/images/g2.jpg',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  category = EXCLUDED.category,
  image = EXCLUDED.image,
  active = EXCLUDED.active,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 5. BLOGS (5 records)
-- ----------------------------------------------------------------------------
INSERT INTO public.blogs (
  id, title, slug, excerpt, content, featured_image, published, published_at
) VALUES
(
  'b0000000-0000-4000-a000-000000000001',
  'Understanding Your Tridosha: Vata, Pitta, and Kapha',
  'understanding-tridosha-vata-pitta-kapha',
  'Learn how the three biological energies govern your physiology, metabolism, and emotional state according to ancient Ayurvedic science.',
  'In Ayurveda, every individual is born with a unique constitutional blueprint known as Prakriti. This constitution is governed by three fundamental biological forces known as the Tridoshas: Vata, Pitta, and Kapha.

Vata represents the kinetic elements of Air and Space. It controls bodily movement, nervous system impulses, breath, and circulation. When out of balance, Vata leads to dry skin, joint cracking, anxiety, and irregular digestion.

Pitta represents Fire and Water. It governs enzymatic transformation, metabolic heat, digestion, and cognitive sharpness. Pitta imbalances often manifest as acidity, inflammatory skin conditions, and irritability.

Kapha embodies Earth and Water. It provides physical structure, joint lubrication, stamina, and psychological groundedness. An aggravated Kapha results in lethargy, slow metabolism, congestion, and water retention.

By identifying your dominant dosha and current imbalance (Vikriti) through classical Nadi Pariksha (pulse diagnosis), your Vaidya can prescribe tailored herbs, therapies, and dietary habits to maintain harmony throughout life.',
  '/images/g3.jpg',
  true,
  '2026-10-02T10:00:00Z'
),
(
  'b0000000-0000-4000-a000-000000000002',
  'Panchakarma: The Complete Guide to Classical Ayurvedic Detox',
  'panchakarma-complete-guide-to-detox',
  'Discover the five classical purification therapies designed to eliminate deep-seated cellular toxins and restore natural vitality.',
  'Modern lifestyles expose our bodies to continuous metabolic wastes and environmental toxins (Ama). While ordinary cleanses only address the surface, classical Panchakarma reaches cellular tissues (Dhatus) to reset your physiological balance.

The Panchakarma protocol consists of three essential phases: Poorva Karma (pre-cleansing therapies such as Snehana oil massage and Swedana herbal steam), Pradhana Karma (the main detoxification procedures), and Paschat Karma (post-cleansing restoration and dietary revival).

The five master therapies include Vamana (therapeutic emesis for Kapha disorders), Virechana (herbal purgation for Pitta and liver cleansing), Basti (medicated herbal enemas for chronic Vata and joint ailments), Nasya (nasal administration for sensory and sinus clarity), and Raktamokshana (blood purification for stubborn skin ailments).

Administered under close medical supervision at our Vidyavihar clinic, a personalized Panchakarma program leaves the body deeply refreshed, rejuvenated, and resilient against future disease.',
  '/images/panchkaram.jpeg',
  true,
  '2026-09-28T10:00:00Z'
),
(
  'b0000000-0000-4000-a000-000000000003',
  'Natural Ayurvedic Approaches to Joint Pain & Arthritis',
  'natural-ayurvedic-remedies-for-joint-pain',
  'Explore time-tested Ayurvedic therapies like Janu Basti, herbal oils, and anti-inflammatory herbs that ease chronic joint stiffness.',
  'In classical Ayurveda, chronic joint pain (Sandhivata) and inflammatory arthritis (Amavata) are primarily triggered by aggravated Vata dosha combined with toxic accumulations in joint capsules.

When joint cartilage loses its natural lubrication (Shleshaka Kapha), friction and stiffness occur. Conventional painkillers temporarily mask the ache, but Ayurvedic therapy works to replenish joint synovial fluid and calm nerve sensitivity.

Key clinical therapies at Charak Ayurveda include Janu Basti (retention of warm medicated herbal oil over the knees), Kati Basti for lower lumbar stiffness, and Patra Pinda Sweda (warm herbal leaf poultice therapy).

Accompanied by potent herbal rasayanas like Sallaki, Guggulu, and Ashwagandha, patients experience enhanced mobility, reduced swelling, and long-term joint relief without digestive side effects.',
  '/images/joint.png',
  true,
  '2026-09-22T10:00:00Z'
),
(
  'b0000000-0000-4000-a000-000000000004',
  'Dinacharya: The Vedic Daily Routine for Everyday Vitality',
  'dinacharya-daily-ayurvedic-routine-for-energy',
  'Small, consistent morning rituals that align your internal biological clock with the natural rhythms of the universe.',
  'Acharya Charak emphasized that staying healthy requires living in synchronization with nature''s diurnal cycles. This daily discipline is called Dinacharya.

Begin by waking during Brahma Muhurta (roughly 45 minutes before sunrise) when the atmosphere is rich in pure Sattvic energy. Drinking warm water first thing in the morning gently stimulates bowel motility and flushes overnight digestive residue.

Incorporate simple cleansing practices: tongue scraping (Jihwa Nirlekhana) to remove Ama, oil pulling (Gandusha) with sesame oil for oral and gum strength, and a 5-minute self-Abhyanga (warm oil massage) prior to bathing.

Honoring these daily rituals stabilizes nervous system fluctuations, sharpens mental clarity, and supports uninterrupted natural digestion throughout your working day.',
  '/images/g2.jpg',
  true,
  '2026-09-15T10:00:00Z'
),
(
  'b0000000-0000-4000-a000-000000000005',
  'Ayurvedic Skin Care: Healing Eczema & Acne from Within',
  'ayurvedic-skin-care-treating-from-within',
  'Why true skin radiance and freedom from chronic skin conditions begins with blood purification and cooling internal Pitta fire.',
  'In the Ayurvedic medical system, the skin is viewed as an external mirror of your blood tissue (Rakta Dhatu) and digestive harmony (Agni). Applying cosmetic creams alone rarely resolves stubborn conditions like psoriasis, chronic eczema, or severe cystic acne.

When digestion is impaired, undigested metabolites ferment into toxic Ama, which enters the circulation and overheats Rakta-Pitta. This toxic heat manifests through the epidermis as redness, itching, pustules, and flaking.

True healing begins from within through Rakta Shodhana (herbal blood purifying decoctions containing Manjistha, Neem, Khadira, and Sariva).

Combined with individualized dietary guidelines that eliminate conflicting foods (Viruddha Ahara), patients witness clear, radiant, and nourished skin without harsh chemical interventions.',
  '/images/skincare.jpeg',
  true,
  '2026-09-08T10:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 6. PATIENT STORIES (5 records)
-- ----------------------------------------------------------------------------
INSERT INTO public.patient_stories (
  id, patient_name, treatment, story, image, rating, published
) VALUES
(
  'c0000000-0000-4000-a000-000000000001',
  'Riya S.',
  'Joint Care',
  'The consultation was patient and explained every next step clearly. I felt supported throughout the process.',
  '/images/joint.png',
  5,
  true
),
(
  'c0000000-0000-4000-a000-000000000002',
  'Aman K.',
  'Skin Care',
  'My skin concerns were approached with care, hygiene and a plan tailored to my constitution.',
  '/images/skincare.jpeg',
  5,
  true
),
(
  'c0000000-0000-4000-a000-000000000003',
  'Neha P.',
  'Panchakarma',
  'The temple-like atmosphere and attentive physician made the experience peaceful and reassuring.',
  '/images/panchkaram.jpeg',
  5,
  true
),
(
  'c0000000-0000-4000-a000-000000000004',
  'Vikram M.',
  'Digestive Wellness',
  'I received practical guidance and a clear plan for my food habits and recovery.',
  '/images/g3.jpg',
  4,
  true
),
(
  'c0000000-0000-4000-a000-000000000005',
  'Priya G.',
  'Fertility Wellness',
  'The team listened without judgement and helped us understand our options with compassion.',
  '/images/infertility.png',
  5,
  true
)
ON CONFLICT (id) DO UPDATE SET
  patient_name = EXCLUDED.patient_name,
  treatment = EXCLUDED.treatment,
  story = EXCLUDED.story,
  image = EXCLUDED.image,
  rating = EXCLUDED.rating,
  published = EXCLUDED.published;

-- ----------------------------------------------------------------------------
-- 7. GALLERY (10 records)
-- ----------------------------------------------------------------------------
INSERT INTO public.gallery (
  id, title, image, category, published
) VALUES
('f0000000-0000-4000-a000-000000000001', 'Consultation Sanctuary', '/images/g2.jpg', 'clinic', true),
('f0000000-0000-4000-a000-000000000002', 'Panchakarma Treatment', '/images/panchkaram.jpeg', 'therapy', true),
('f0000000-0000-4000-a000-000000000003', 'Herbal Formulations', '/images/g3.jpg', 'herbs', true),
('f0000000-0000-4000-a000-000000000004', 'Joint Care Therapy', '/images/joint.png', 'therapy', true),
('f0000000-0000-4000-a000-000000000005', 'Skin Care Support', '/images/skincare.jpeg', 'clinic', true),
('f0000000-0000-4000-a000-000000000006', 'Nadi Pariksha', '/images/g5.jpg', 'clinic', true),
('f0000000-0000-4000-a000-000000000007', 'Herbal Oil Preparation', '/images/g4.jpg', 'herbs', true),
('f0000000-0000-4000-a000-000000000008', 'Therapeutic Space', '/images/ourApproach.jpeg', 'clinic', true),
('f0000000-0000-4000-a000-000000000009', 'Joint Care Treatment', '/images/joint.png', 'therapy', true),
('f0000000-0000-4000-a000-000000000010', 'Herbal Wellness', '/images/g3.jpg', 'herbs', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  image = EXCLUDED.image,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

-- ----------------------------------------------------------------------------
-- 8. ORDERS (3 sample records)
-- ----------------------------------------------------------------------------
INSERT INTO public.orders (
  id, customer_name, phone, email, address, city, state, pincode, subtotal, total, payment_status, order_status, created_at
) VALUES
(
  '00000001-0000-4000-a000-000000000001',
  'Rohan Mehta',
  '+91 98765 43210',
  'rohan@example.com',
  '12, Shyam Vatika',
  'Pilani',
  'Rajasthan',
  '333031',
  1499.00,
  1499.00,
  'MOCK_PAID',
  'PROCESSING',
  '2026-10-06T09:30:00.000Z'
),
(
  '00000001-0000-4000-a000-000000000002',
  'Priya Kapoor',
  '+91 91234 56789',
  'priya@example.com',
  '7, Vidyavihar',
  'Pilani',
  'Rajasthan',
  '333031',
  2598.00,
  2598.00,
  'MOCK_PAID',
  'PENDING',
  '2026-10-05T15:00:00.000Z'
),
(
  '00000001-0000-4000-a000-000000000003',
  'Sanjay Rao',
  '+91 99887 76655',
  'sanjay@example.com',
  '21, Main Road',
  'Jhunjhunu',
  'Rajasthan',
  '333001',
  1799.00,
  1799.00,
  'PENDING',
  'SHIPPED',
  '2026-10-04T11:15:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  pincode = EXCLUDED.pincode,
  subtotal = EXCLUDED.subtotal,
  total = EXCLUDED.total,
  payment_status = EXCLUDED.payment_status,
  order_status = EXCLUDED.order_status,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 9. ORDER ITEMS (3 sample records)
-- ----------------------------------------------------------------------------
INSERT INTO public.order_items (
  id, order_id, product_id, quantity, price_at_purchase
) VALUES
(
  '00000003-0000-4000-a000-000000000001',
  '00000001-0000-4000-a000-000000000001',
  'e0000000-0000-4000-a000-000000000001',
  1,
  1499.00
),
(
  '00000003-0000-4000-a000-000000000002',
  '00000001-0000-4000-a000-000000000002',
  'e0000000-0000-4000-a000-000000000002',
  2,
  1299.00
),
(
  '00000003-0000-4000-a000-000000000003',
  '00000001-0000-4000-a000-000000000003',
  'e0000000-0000-4000-a000-000000000003',
  1,
  1799.00
)
ON CONFLICT (id) DO UPDATE SET
  order_id = EXCLUDED.order_id,
  product_id = EXCLUDED.product_id,
  quantity = EXCLUDED.quantity,
  price_at_purchase = EXCLUDED.price_at_purchase;

-- ----------------------------------------------------------------------------
-- 10. APPOINTMENTS (4 sample records)
-- ----------------------------------------------------------------------------
INSERT INTO public.appointments (
  id, patient_name, phone, email, doctor_id, treatment_id, appointment_date, start_time, end_time, status, payment_status, notes, created_at
) VALUES
(
  '00000002-0000-4000-a000-000000000001',
  'Rohan Mehta',
  '+91 98765 43210',
  'rohan@example.com',
  'd0c00000-0000-4000-a000-000000000001',
  '70000000-0000-4000-a000-000000000001',
  '2026-10-06',
  '09:00:00',
  '09:30:00',
  'CONFIRMED',
  'MOCK_PAID',
  'Initial consultation',
  '2026-10-05T09:00:00.000Z'
),
(
  '00000002-0000-4000-a000-000000000002',
  'Priya Kapoor',
  '+91 91234 56789',
  'priya@example.com',
  'd0c00000-0000-4000-a000-000000000002',
  '70000000-0000-4000-a000-000000000002',
  '2026-10-06',
  '10:30:00',
  '11:15:00',
  'PENDING',
  'MOCK_PAID',
  'Skin care follow-up',
  '2026-10-05T14:00:00.000Z'
),
(
  '00000002-0000-4000-a000-000000000003',
  'Sanjay Rao',
  '+91 99887 76655',
  'sanjay@example.com',
  'd0c00000-0000-4000-a000-000000000003',
  '70000000-0000-4000-a000-000000000003',
  '2026-10-07',
  '11:00:00',
  '11:45:00',
  'COMPLETED',
  'PAID',
  'Joint consultation',
  '2026-10-03T10:00:00.000Z'
),
(
  '00000002-0000-4000-a000-000000000004',
  'Aarav Singh',
  '+91 90000 00000',
  'aarav@example.com',
  'd0c00000-0000-4000-a000-000000000001',
  '70000000-0000-4000-a000-000000000005',
  '2026-10-08',
  '09:30:00',
  '10:15:00',
  'CANCELLED',
  'CANCELLED',
  '',
  '2026-10-04T16:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
  patient_name = EXCLUDED.patient_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  doctor_id = EXCLUDED.doctor_id,
  treatment_id = EXCLUDED.treatment_id,
  appointment_date = EXCLUDED.appointment_date,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  status = EXCLUDED.status,
  payment_status = EXCLUDED.payment_status,
  notes = EXCLUDED.notes,
  updated_at = now();
