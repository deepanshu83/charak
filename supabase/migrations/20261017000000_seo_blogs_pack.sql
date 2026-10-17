-- ============================================================================
-- 10 SEO-Ready Health Blogs Migration & Seed for Charak Ayurveda Pilani
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Ayurvedic Care',
  author TEXT NOT NULL DEFAULT 'Charak Medical Team',
  read_time TEXT DEFAULT '5 min read',
  featured_image TEXT,
  storage_path TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs"
  ON public.blogs FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins have full access to blogs" ON public.blogs;
CREATE POLICY "Admins have full access to blogs"
  ON public.blogs FOR ALL
  TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Upsert the 10 SEO-ready blogs
INSERT INTO public.blogs (title, slug, excerpt, content, category, author, read_time, featured_image, published, published_at)
VALUES
(
  'Panchakarma in Ayurveda: Therapies, Benefits, Preparation and Safety',
  'panchakarma-therapies-benefits-safety-pilani',
  'Understand Panchakarma therapies, preparation, aftercare and safety. Learn why an individual assessment matters before starting treatment in Pilani.',
  'Panchakarma is a group of traditional Ayurvedic procedures, not one standard massage or a one-size-fits-all “detox”. The plan, if appropriate, depends on a person’s health, symptoms, age, medicines, and the practitioner’s assessment. Anyone searching for Panchakarma treatment in Pilani should understand what the procedures involve, what preparation may be needed, and when medical advice is essential.

The five classical procedures commonly associated with Panchakarma are Vamana (therapeutic emesis), Virechana (therapeutic purgation), Basti (medicated enema), Nasya (nasal administration of selected preparations), and Raktamokshana (bloodletting in traditions that use it). These are distinct procedures, and they are not suitable for everyone. They should never be attempted at home or chosen from a checklist without a qualified assessment.

Abhyanga is an oil-based massage; Swedana refers to selected sweating or heat-based procedures; Shirodhara involves a controlled stream of liquid over the forehead; and local treatments may include Pizhichil, Kizhi, or other regionally used techniques. Clinics may group supportive therapies with a care plan, but they are not interchangeable with the five classical procedures. Ask exactly what is proposed, why it is being recommended, what it costs, and what risks or restrictions apply.

A consultation should review your symptoms and goals; medical history; pregnancy or possibility of pregnancy; blood pressure and glucose control when relevant; allergies; recent surgery; current medicines and supplements; and any liver, kidney, heart, bleeding, or other chronic condition. Tell the practitioner about every medicine you take. Do not stop prescribed medicines or delay investigations because you are considering Ayurveda.

Depending on the selected procedure, instructions may involve meals, hydration, rest, skin care, or avoiding strenuous activity for a short period. Follow instructions given for your specific plan rather than generic advice found online. Ask who will monitor you during a procedure, what side effects are expected, what warning signs require urgent help, and how follow-up will be arranged.

People often explore Panchakarma for relaxation, symptom support, or as part of a broader wellness routine. The evidence for specific health claims varies, and strong claims that Panchakarma removes toxins, cures chronic disease, or guarantees results are not justified. Some Ayurvedic preparations can contain harmful levels of metals, and vigorous cleansing procedures can carry risks, especially for people with medical conditions or dehydration risk. A qualified medical assessment and transparent discussion of evidence are important.

Look for a clean, professional setting, clear explanation of each procedure, informed consent, transparent pricing, and appropriate supervision. A reputable provider should be comfortable explaining when a therapy is not appropriate and when referral to a dermatologist, orthopaedic specialist, gynaecologist, physician, or emergency service is needed.

Panchakarma is best approached as an individualized traditional-care option—not a shortcut or substitute for necessary medical treatment. If you are considering Panchakarma in Pilani, begin with a consultation, disclose your full medical history, and ask for a plan that clearly states the intended goals, precautions, and follow-up.',
  'Panchakarma',
  'Dr. Ramraj Sharma (Panchakarma Specialist)',
  '5 min read',
  '/images/panchkaram.jpeg',
  true,
  now()
),
(
  'Acne, Pimples and Acne Marks: Causes, Daily Care and When to Seek Help',
  'acne-pimples-acne-marks-causes-care-pilani',
  'Learn common causes of acne, how to care for acne-prone skin, why marks linger and when professional evaluation can help in Pilani.',
  'Acne can affect teenagers and adults, and it is more than a cosmetic concern when spots are painful, leave scars, or affect confidence. People often search for acne treatment in Pilani after trying several face washes, home remedies, or products without improvement. The useful first step is to understand what type of problem you have and avoid routines that irritate your skin.

Acne develops when hair follicles become blocked with oil and dead skin cells, followed by inflammation. Hormonal changes, certain medicines, and oily skin or hair products can contribute. Repeated squeezing, harsh scrubbing, and layering multiple strong products can worsen irritation and increase the chance of marks. Adult acne can also occur alongside hormonal conditions such as PCOS, particularly when acne accompanies irregular periods or excess facial hair.

Active acne includes blackheads, whiteheads, inflamed bumps, and deeper painful lesions. Flat brown or dark marks after a pimple are often post-inflammatory pigmentation; an indented or raised texture may be a scar. These concerns need different approaches. Picking spots may increase inflammation and make marks or scars more likely. Do not use skin-lightening creams, steroid combination creams, acids, or potent retinoids without appropriate advice—especially during pregnancy or when pregnancy is possible.

Keep the routine simple and consistent. Wash gently with lukewarm water and a mild cleanser; avoid abrasive scrubs and frequent washing. Choose products labelled non-comedogenic where possible. Use a broad-spectrum sunscreen during the day because sun exposure can make dark marks more noticeable. Remove make-up before sleep and clean items that regularly touch the face, such as phone screens. Introduce one new product at a time so you can spot irritation.

Arrange an assessment if acne is deep or painful, is leaving scars, spreads across the chest or back, persists despite a consistent routine, begins suddenly with other hormonal changes, or affects your mood and daily life. A clinician can help distinguish acne from conditions that look similar and discuss appropriate treatments. In severe cases, prescription treatment may be needed; results often take weeks rather than days.

Some people ask about Ayurvedic approaches for acne and skin health. A safe plan should begin with diagnosis, review of current products and medicines, and a clear explanation of what is known and not known about the proposed approach. “Natural” does not automatically mean harmless, and unlabelled or unverified products can be risky. Avoid promises of a permanent cure or guaranteed mark removal. Do not delay proven dermatological care for severe acne or scarring.

The best acne plan is one you can follow consistently and safely. If pimples, marks, or scars are becoming persistent, seek an individualized review instead of repeatedly switching products. For readers in Pilani, Charak Ayurveda can discuss skin-related concerns and explain whether its available services are appropriate or whether referral to a dermatologist is more suitable.',
  'Skin Health',
  'Dr. Anuja Singhai (Women''s Health & Skin Care)',
  '5 min read',
  '/images/skincare.jpeg',
  true,
  now()
),
(
  'Psoriasis vs Eczema: Symptoms, Triggers and Long-Term Skin Care',
  'psoriasis-vs-eczema-symptoms-care-pilani',
  'Understand common differences between psoriasis and eczema, everyday skin-care steps, warning signs and why correct diagnosis matters.',
  'Persistent itching, dryness, redness, scaling, or recurring rashes can disrupt sleep and confidence. Psoriasis and eczema can sometimes look similar, but they are different conditions and need an accurate assessment. Searching for psoriasis and eczema treatment in Pilani should lead to practical information—not a claim that one remedy works for every rash.

Psoriasis is a chronic inflammatory skin condition that can cause well-defined, dry, scaly patches. Patches may appear on the scalp, elbows, knees, trunk, palms, or soles, and symptoms can come and go. Some people also develop nail changes or joint pain. Psoriasis is not contagious. It can be associated with other health conditions, so persistent symptoms should not be dismissed as ordinary dryness.

Eczema, including atopic dermatitis, commonly causes dry, itchy, inflamed skin. The appearance varies by age, skin tone, body area, and whether the condition is active or healing. Irritants, fragranced products, frequent hot bathing, and individual triggers may aggravate symptoms. Scratching may damage the skin barrier and increase the risk of infection. A clinician can help distinguish eczema from fungal infection, contact dermatitis, psoriasis, scabies, and other causes of itchy skin.

Use a gentle, fragrance-free cleanser and apply a bland moisturiser regularly, especially after bathing. Keep showers comfortably warm rather than hot, avoid scratching, and consider soft cotton clothing. Track possible triggers such as new detergents, fragranced oils, heat, sweating, or stress—but avoid eliminating whole food groups without advice. Ask a clinician before using steroid creams, particularly on the face, groin, large areas, or for long periods. Do not apply unverified mixtures to broken or infected skin.

Get a medical assessment for a rash that is persistent, spreading, painful, repeatedly returning, disturbing sleep, affecting the face or genitals, or not responding to basic care. Seek prompt care if the skin becomes very hot, swollen, rapidly more painful, starts draining pus, or is accompanied by fever. Joint swelling or morning stiffness in someone with psoriasis also deserves evaluation.

Some patients explore Ayurvedic care as a complementary approach to well-being. If you do, share your full diagnosis and all prescribed medicines with the practitioner. Ask what outcome is realistic and whether the proposed therapy may irritate the skin or interact with medication. Do not stop prescribed topical or systemic treatment abruptly. Some Ayurvedic preparations can contain toxic metals, and evidence for specific claims varies; a cautious, coordinated approach is safer than a promise of cure.

The key first step is identifying the condition. Psoriasis, eczema, fungal disease and other rashes can overlap in appearance, and the wrong treatment can worsen some conditions. For persistent symptoms in Pilani, book an assessment with an appropriately qualified clinician and use any traditional therapies only with clear precautions and realistic expectations.',
  'Skin Health',
  'Dr. Ramraj Sharma (Panchakarma & Skin Care)',
  '5 min read',
  '/images/skincare.jpeg',
  true,
  now()
),
(
  'Trying to Conceive? Infertility Causes, Tests and When to Seek Help',
  'infertility-causes-tests-when-to-seek-help-pilani',
  'Learn common reasons for difficulty conceiving, which evaluations may be discussed, when to seek help and how to approach supportive care safely.',
  'Difficulty conceiving can be emotionally draining, and it should never be treated as one partner’s fault. Fertility involves both partners, and many different factors can contribute. Anyone looking for an infertility consultation in Pilani deserves clear information, privacy, and guidance on when to seek a full fertility evaluation.

Possible causes include irregular or absent ovulation, PCOS, age-related changes in fertility, endometriosis, blocked or damaged fallopian tubes, uterine conditions, sperm count or movement problems, sexual difficulties, and some medical or treatment histories. Sometimes initial testing does not identify a clear cause. Fertility challenges can affect either partner or both, so testing only one person may miss important information.

A common guideline is to arrange an evaluation after 12 months of regular unprotected intercourse if the female partner is younger than 35, and after six months at age 35 or older. Seek advice sooner if periods are absent or highly irregular, there is a known reproductive condition, there has been cancer treatment, recurrent pregnancy loss, a history of pelvic infection or surgery, or another reason to be concerned. Do not wait for a fixed timeline if a clinician has already advised evaluation.

The clinician usually starts with medical and menstrual history, how long you have been trying, previous pregnancies, medications, and relevant lifestyle factors. Depending on the situation, evaluation may include semen analysis, assessment of ovulation, blood tests, ultrasound, or tests for the reproductive tract. The right tests depend on the history; not everyone needs every test. Bring any previous reports and a list of medicines to appointments.

Avoid tobacco, work toward regular sleep and physical activity, and discuss alcohol, supplements, weight changes, and medicines with a health professional. Do not assume that a fertility problem is caused by stress or that relaxation alone will resolve it. Do not take hormone products, fertility herbs, or high-dose supplements without qualified advice; they can interact with medicines or delay necessary care. If pregnancy is possible, disclose that before any therapy or medication is started.

Some couples explore Ayurveda for general well-being while fertility investigations proceed. Keep the roles clear: supportive care should not replace time-sensitive fertility assessment or proven treatment options. Ask the practitioner to explain the evidence, precautions and expected costs. Avoid guarantees of conception, claims that one cleansing procedure removes the cause of infertility, or advice to stop fertility medication. Coordinating care with a gynaecologist or fertility specialist helps prevent delays.

You do not have to navigate fertility concerns alone, and both partners deserve respectful care. Early assessment can clarify next steps and protect time, particularly when age or a known condition may affect fertility. If you are considering supportive Ayurvedic care in Pilani, use it alongside—not instead of—appropriate fertility evaluation.',
  'Fertility & Women''s Health',
  'Dr. Anuja Singhai (Gynaecology & Fertility Specialist)',
  '5 min read',
  '/images/infertility.png',
  true,
  now()
),
(
  'Back, Neck, Knee and Joint Pain: Common Causes and Safe First Steps',
  'back-neck-knee-joint-pain-causes-pilani',
  'Explore common causes of back, neck, knee and joint pain, safe movement tips, warning signs and when assessment is important in Pilani.',
  'Back stiffness after long study sessions, neck pain from a laptop, sore knees after activity, and recurring body aches are common reasons people look for pain care. But pain is a symptom, not a diagnosis. A useful plan starts by understanding where the pain occurs, how it began, what worsens it, and whether warning signs are present.

Common contributors to pain include muscle strain, prolonged static posture, sudden increases in exercise, tendon irritation, arthritis, old injuries, and nerve-related problems. Stiffness after rest, swelling, tingling, weakness, or pain spreading into an arm or leg may change the type of assessment needed. Persistent or recurring pain should not automatically be blamed on age, posture, or “weakness”.

For many uncomplicated episodes, staying gently active is often more helpful than prolonged bed rest. Take short movement breaks during long desk sessions, adjust the screen toward eye level, support your back, and vary positions instead of trying to hold a perfect posture all day. Build activity gradually and use exercises suited to your condition. Heat or cold packs wrapped in a towel may provide temporary comfort for some people; protect the skin and stop if discomfort increases.

Seek urgent medical care for new bladder or bowel control problems, numbness around the groin or saddle area, rapidly worsening weakness, serious pain after major injury, or back pain with chest pain. Fever, unexplained weight loss, a history of cancer, a hot swollen joint, or severe night pain also require prompt assessment. Sudden severe joint pain with fever may signal an emergency. Do not use massage or heat over an undiagnosed injury, suspected fracture, or acutely inflamed area.

People may consider Abhyanga, local oil applications, Swedana, or other traditional therapies for comfort. Whether any therapy is suitable depends on the cause of pain, injury stage, skin health, circulation, sensation, and medical history. Deep massage or heat may be inappropriate in some conditions. A responsible provider should screen for warning signs, explain the intended goal, and refer you for medical assessment when needed.

Good pain management focuses on more than temporarily reducing discomfort. Depending on the diagnosis, a plan may combine activity modification, physiotherapy or clinician-guided exercise, sleep support, medication when prescribed, and agreed complementary care. Track function as well as pain—for example, walking distance, ability to sit through a class, or sleep quality. If pain is worsening or not improving, revisit the diagnosis rather than simply repeating the same treatment.

For persistent back, neck, knee or joint pain in Pilani, choose assessment before choosing a therapy. Share any scan reports, injury details, current medicines, and existing medical conditions. Pain relief should support safe movement and daily function, not delay care for a serious cause.',
  'Pain Care & Orthopaedics',
  'Dr. Varij Pandey (Orthopaedic Care Specialist)',
  '5 min read',
  '/images/joint.png',
  true,
  now()
),
(
  'Diabetes and High Blood Pressure: Daily Habits That Support Medical Care',
  'diabetes-high-blood-pressure-lifestyle-habits',
  'Practical habits for food, movement, sleep and monitoring that support diabetes and blood-pressure care—without replacing prescribed treatment.',
  'Diabetes and high blood pressure can remain unnoticed for a long time, yet both can raise the risk of serious complications. People often search for lifestyle or Ayurvedic support because they want a sustainable routine. The safest starting point is to combine daily habits with regular clinical monitoring and prescribed treatment, not to choose between them.

Type 2 diabetes is influenced by several factors, including genetics, body weight, diet, activity and other health conditions. High blood pressure is also influenced by family history, age, activity, body weight, sodium intake, tobacco and other factors. A person may feel completely well despite elevated readings, so symptoms alone are not a reliable guide. Regular measurements and follow-up are essential.

Aim for regular, balanced meals that include vegetables, appropriate portions of protein, high-fibre foods and minimally processed options. Reduce excess salt and frequent high-sugar drinks. There is no single “diabetes diet” that suits everybody; portions, medicines, kidney function, food preferences and other conditions matter. If you use insulin or glucose-lowering medicine, ask your clinician how to handle exercise and changes in meal timing to reduce the risk of low blood sugar.

Start with activity that fits your health and ability, then build consistency. Walking, cycling, household activity and strength work can all count. Break up long sitting periods and ask for tailored advice if you have foot problems, heart disease, severe pain, or other limitations. Keep a regular sleep schedule, work on stress management, and seek help to stop tobacco use. These habits support health but do not guarantee that medication will no longer be needed.

Keep a record of blood pressure and glucose readings if your care team recommends it. Bring the record to appointments and ask what ranges should trigger a call. Take prescribed medicines as directed; do not reduce or stop them because a reading improves or because you begin a traditional therapy. Seek urgent care for severe symptoms such as chest pain, difficulty breathing, confusion, sudden weakness, or very high blood pressure with concerning symptoms.

Some people use Ayurveda for dietary guidance, relaxation or supportive care. Evidence differs by intervention, and some preparations can interact with medication or contain harmful substances. “Natural” products can still cause harm. Tell every clinician about herbs, supplements and therapies you use. A trustworthy practitioner will not promise a cure for diabetes or hypertension, advise stopping tablets without medical oversight, or replace essential checks.

Long-term condition management is built through repeatable habits, monitoring and appropriate medical care. If you are exploring a supportive wellness plan in Pilani, agree on clear goals with your care team, keep taking prescribed treatment, and review progress with measurable indicators such as readings, activity, sleep and follow-up results.',
  'Lifestyle & Chronic Care',
  'Dr. Ramraj Sharma (Lifestyle Disorders Specialist)',
  '5 min read',
  '/images/g3.jpg',
  true,
  now()
),
(
  'Stress and Insomnia in Students and Working Professionals: A Practical Reset',
  'stress-insomnia-sleep-habits-pilani',
  'A practical guide to stress, sleep difficulty and sustainable routines for students and professionals, with signs that need clinical support.',
  'Long study hours, deadlines, rotating work demands, screen exposure and irregular routines can make it difficult to switch off at night. Short periods of stress are part of life, but persistent sleep problems can affect attention, mood, energy and physical health. Students and working professionals in Pilani may benefit from a practical routine—and from knowing when sleep difficulty needs clinical assessment.

Insomnia can involve taking a long time to fall asleep, waking during the night, waking too early, or feeling unrefreshed despite spending enough time in bed. It may be short-term or persistent. Stress can contribute, but so can pain, depression or anxiety, certain medicines, caffeine, alcohol, sleep apnoea and other conditions. If sleep trouble happens often, do not assume it is simply a lack of discipline.

Choose a consistent wake-up time, including weekends when feasible. Get outdoor light early in the day, keep naps short or avoid them if they make nighttime sleep harder, and reduce caffeine later in the day. Give yourself a wind-down period that is not spent working in bed. If thoughts are racing, write tomorrow’s tasks and the next small step on paper before bedtime. Keep the bedroom dark, quiet and comfortable where possible.

A useful routine is to schedule focused work blocks, short movement breaks, meals, and a clear stopping point for the day. Try slow breathing, gentle stretching or a short walk as a transition out of study or work. These can support relaxation, but they are not substitutes for treatment when stress is severe. Avoid relying on alcohol, unprescribed sedatives, or herbal sleep products without checking safety and interactions.

Talk with a healthcare professional when sleep problems persist for weeks, repeatedly affect study or work, or are accompanied by loud snoring, pauses in breathing, severe daytime sleepiness, persistent low mood, panic symptoms, or increased use of substances to sleep. If you have thoughts of self-harm or feel unsafe, seek immediate local emergency or crisis support. A clinician may review medicines, physical health, mental health, and evidence-based treatments for insomnia.

Some people find a calming routine, gentle massage or guided relaxation helpful as part of general well-being. Suitability varies, and no therapy should be marketed as a guaranteed cure for insomnia or as a replacement for assessment of sleep apnoea, depression, or another medical cause. Ask about ingredients, contraindications and interactions before taking herbal preparations, particularly if you use regular medicines or may be pregnant.

Better sleep usually comes from a pattern of habits rather than a single trick. Start with a consistent wake time and a calmer evening routine, then track whether the change helps. For students, researchers, faculty and professionals in Pilani, seeking support early is sensible when sleep difficulty starts to interfere with daily life.',
  'Stress & Sleep',
  'Dr. Ramraj Sharma (Lifestyle Disorders Specialist)',
  '5 min read',
  '/images/g4.jpg',
  true,
  now()
),
(
  'PCOS and PCOD: Irregular Periods, Acne, Weight Changes and Fertility',
  'pcos-pcod-symptoms-womens-health-pilani',
  'Understand PCOS symptoms, irregular periods, acne, metabolic health and fertility questions—and why an individualized medical assessment matters.',
  'Irregular periods, persistent acne, unwanted facial hair, scalp hair thinning, and changes in weight can be frustrating—especially when the cause is unclear. Polycystic ovary syndrome (PCOS), often called PCOD in everyday conversation, is a common hormonal and metabolic condition that can affect menstrual cycles, skin, and fertility. Symptoms vary, and one symptom alone cannot confirm the diagnosis.

Possible signs include periods that are irregular or absent, difficulty predicting ovulation, acne, excess facial or body hair, scalp hair thinning, and sometimes darkened skin patches linked with insulin resistance. Some people have weight changes; others do not. PCOS is not simply “cysts on the ovaries”, and a scan alone is not enough to determine every case. Diagnosis usually involves a history, examination and tests to assess symptoms and rule out other causes.

Hormone changes can influence ovulation and oil production in the skin. This is why some people notice acne alongside irregular cycles. However, acne also has other causes, and irregular periods may relate to thyroid conditions, pregnancy, stress, changes in weight, exercise patterns or other health conditions. Sudden severe symptoms, very heavy bleeding, or long gaps between periods should be discussed with a clinician rather than managed with home remedies alone.

Regular physical activity, balanced meals, adequate sleep and realistic stress-management habits can support overall metabolic health. Focus on routines you can maintain rather than crash diets or claims that a single food removes PCOS. Your plan may need to account for blood glucose, cholesterol, blood pressure, fertility goals and mental health. A healthcare professional may recommend periodic checks and treatments for cycle regulation, acne, excess hair growth or fertility, depending on your needs.

PCOS can disrupt ovulation and make conception more difficult for some people, but it does not mean pregnancy is impossible. If you are trying to conceive, ask for timely fertility advice rather than waiting indefinitely or relying on a guarantee from any practitioner. If you are not trying to conceive, irregular cycles still deserve attention because clinicians may want to address cycle patterns and related risks.

Some women explore Ayurveda alongside a broader care plan. If you do, disclose all medicines and supplements, ask about evidence and side effects, and avoid products that promise hormonal “reset”, permanent cure, or guaranteed pregnancy. Do not stop prescribed hormonal, metabolic or fertility treatment without the treating clinician’s guidance. A respectful plan should support your goals while keeping appropriate diagnostic testing and follow-up in place.

PCOS is manageable, but it is not identical for every woman. Get assessed if you have persistently irregular periods, acne with other hormonal signs, or fertility concerns. For women in Pilani, a consultation can help clarify symptoms and next steps, with specialist referral when needed.',
  'Women''s Health',
  'Dr. Anuja Singhai (Gynaecology & Fertility Specialist)',
  '5 min read',
  '/images/infertility.png',
  true,
  now()
),
(
  'Bloating, Acidity, Constipation and IBS: What Your Gut Symptoms May Mean',
  'bloating-acidity-constipation-ibs-gut-health',
  'Learn common causes of bloating, constipation, acidity and IBS-like symptoms, practical habits and digestive warning signs that need medical care.',
  'Bloating after meals, gas, constipation, loose stools, acidity and abdominal discomfort can disrupt daily life. These symptoms are common, but they can arise from different causes—from meal patterns and medication effects to reflux, food intolerance, infection or irritable bowel syndrome (IBS). The safest approach is to look for patterns without assuming every digestive symptom is caused by “toxins” or poor digestion.

Bloating is a sensation of fullness or swelling and can occur with constipation, certain foods, swallowed air or functional gut disorders. Constipation may involve hard stools, straining or fewer bowel movements than is usual for you. Acidity or heartburn can involve burning behind the breastbone or sour fluid coming up. IBS commonly involves abdominal pain related to bowel movements alongside a change in bowel habits, including constipation, diarrhoea or both. Similar symptoms can also come from other conditions, so persistent symptoms may need evaluation.

For one or two weeks, note meal timing, foods and drinks, bowel habits, pain, stress, sleep and any medicines or supplements. Eat at a manageable pace, drink enough fluids, and increase fibre gradually if constipation is a concern. Regular movement can support bowel regularity. Large late-night meals, excess caffeine or foods that reliably trigger symptoms may be worth reviewing. Avoid strict elimination diets without guidance, because they can become nutritionally inadequate and may not address the underlying cause.

Seek medical advice for symptoms that persist, keep returning or interfere with eating and daily activity. Prompt assessment is especially important for blood in stool, black stool, unexplained weight loss, persistent vomiting, fever, anaemia, a new or severe abdominal pain, difficulty swallowing, or symptoms that wake you repeatedly at night. Severe pain, a rigid abdomen, fainting or vomiting blood requires urgent medical care. Do not rely on a gut-health supplement to mask warning signs.

Ayurvedic consultations may include discussion of meal routines and individual habits. Be cautious with strong claims about curing IBS, reflux, ulcers or inflammatory bowel disease, since the evidence varies by approach and diagnosis. Some herbal products can interact with medicines or contain contaminants. Share your complete medication list and any known diagnosis with the practitioner. Do not stop acid-suppressing medicines, prescribed bowel treatment or other therapy without the prescribing clinician’s advice.

The right plan depends on the symptom pattern and any warning signs. A clinician may review diet, medicines and medical history, and decide whether tests or referral are needed. Once serious causes are considered, simple changes such as regular meals, hydration, activity and individualized dietary guidance may be useful. For recurring digestive symptoms in Pilani, seek assessment before starting a restrictive diet or multiple supplements.

Your gut symptoms are real, but one explanation does not fit everyone. Track the pattern, use gradual and sustainable habits, and get professional advice if symptoms persist or warning signs appear. Complementary care should fit around a clear diagnosis and appropriate treatment.',
  'Gut Health',
  'Dr. Ramraj Sharma (Panchakarma & Gut Health)',
  '5 min read',
  '/images/g5.jpg',
  true,
  now()
),
(
  'Looking for an Ayurveda Clinic Near BITS Pilani or CSIR-CEERI? A Local Guide',
  'ayurveda-clinic-near-bits-pilani-ceeri',
  'Find Charak Ayurveda & Panchakarma Chikitsalaya in Vidyavihar, Pilani. Explore Panchakarma, skin, pain, women’s health, gut and lifestyle concerns.',
  'Living, studying or working in Pilani can mean long hours at a desk, irregular meals, deadlines, travel between campus and home, and limited time to arrange appointments. If you are searching for an Ayurveda clinic near BITS Pilani or CSIR-CEERI, it helps to find a location that is easy to identify and a care team that explains its services and limits clearly.

Charak Ayurveda & Panchakarma Chikitsalaya is located at Beside Birla Hospital, Shyam Vatika, Vidyavihar, Rajasthan 333031. The location is in the Pilani–Vidyavihar area, serving people looking for information about Panchakarma and Ayurveda-related consultations. Use the current Google Maps directions link on this page before travelling; road routes and estimated distances can vary depending on the starting gate, route and traffic. Do not rely on an old screenshot or a distance mentioned elsewhere without checking the live route.

Depending on the services currently offered and the practitioner’s assessment, patients may ask about Panchakarma and supportive therapies, recurring acne or skin concerns, body and joint pain, women’s health and PCOS, fertility-related questions, digestive symptoms, stress, sleep and broader lifestyle habits. A website list does not mean every condition can be diagnosed or managed at one clinic. Ask whether the clinic can assess your concern directly or whether you should see a dermatologist, orthopaedic specialist, gynaecologist, fertility specialist or physician.

If you spend much of the day studying, coding, teaching or working in a laboratory, make time for regular movement breaks, meals and sleep. Bring a concise list of symptoms and medicines to an appointment; note when the problem started, what makes it better or worse, and any previous investigations. If you have a chronic condition such as diabetes or high blood pressure, continue your prescribed follow-up and medicines. Complementary care should not delay needed diagnosis or treatment.

Ask who will conduct the consultation, what the assessment includes, which specific therapy is being suggested, what it is expected to help with, how many sessions may be considered, what the total cost is, and what risks or restrictions apply. Disclose pregnancy or the possibility of pregnancy, allergies, recent surgery, and all prescribed medicines and supplements. Be cautious of guaranteed cures, pressure to purchase a large package, or advice to stop prescribed treatment.

Search the full clinic name—Charak Ayurveda & Panchakarma Chikitsalaya—and confirm that the map pin matches Shyam Vatika, Vidyavihar, Rajasthan 333031. Before publishing this page, the clinic team should add the verified Google Business Profile link, a working phone or WhatsApp contact, opening hours, recent exterior photographs and a clear entrance landmark. From this page, link directly to directions to BITS Pilani and CSIR-CEERI so visitors can check their own route from the correct campus gate.

Local convenience matters, but safe and transparent care matters more. Charak Ayurveda aims to make its location and areas of interest clear for people in Pilani and Vidyavihar. Check the current directions, confirm appointment availability, and seek specialist or emergency care when your symptoms require it. This page is an informational guide and does not imply affiliation with or endorsement by BITS Pilani or CSIR-CEERI.',
  'Local Pilani Guide',
  'Dr. Ramraj Sharma & Dr. Varij Pandey',
  '5 min read',
  '/images/ourApproach.jpeg',
  true,
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  featured_image = EXCLUDED.featured_image,
  published = EXCLUDED.published,
  updated_at = now();
