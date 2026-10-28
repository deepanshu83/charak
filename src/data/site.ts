import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, Flower2, HeartHandshake, MapPin, ShieldCheck, Stethoscope, UserCheck, Wind, Flame, Mountain } from "lucide-react";

export interface Treatment {
  id: string;
  num: string;
  title: string;
  desc: string;
  image: string;
  highlights: string[];
}

export interface DoshaData {
  name: string;
  elements: string;
  icon: LucideIcon;
  tagline: string;
  personality: string;
  imbalanceSigns: string[];
  balanceTips: string[];
  bestFoods: string[];
}

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: "therapy" | "clinic" | "herbs";
  caption: string;
}

export interface Review {
  text: string;
  author: string;
  location: string;
  treatment: string;
}

export const treatments: Treatment[] = [];

export const doshas: Record<"vata" | "pitta" | "kapha", DoshaData> = {
  vata: {
    name: "Vata",
    elements: "Air & Space (Vayu & Akasha)",
    icon: Wind,
    tagline: "The Energy of Movement & Creativity",
    personality: "Vata individuals are typically quick-thinking, artistic, imaginative, enthusiastic, and slender. When in balance, they are vibrant and full of creative inspiration.",
    imbalanceSigns: ["Dry skin, dry hair, brittle nails", "Joint cracking, stiffness or lower back pain", "Anxiety, racing thoughts, restless insomnia", "Irregular appetite, constipation and bloating"],
    balanceTips: ["Warm sesame oil massage (Abhyanga)", "Strict daily routine & grounding meditation", "Warm, cooked, unctuous and hearty foods", "Avoid cold, raw, dry salads and irregular hours"],
    bestFoods: ["Warm soups", "Cooked whole grains", "Ghee & warm milk", "Sweet ripe fruits"],
  },
  pitta: {
    name: "Pitta",
    elements: "Fire & Water (Tejas & Jala)",
    icon: Flame,
    tagline: "The Energy of Digestion & Transformation",
    personality: "Pitta types are natural leaders: sharp, ambitious, focused, articulate, and passionate. They have robust digestion and high intellect.",
    imbalanceSigns: ["Hyperacidity, heartburn, acid reflux", "Skin inflammation, redness, rashes, acne", "Irritability, impatience, short temper", "Excessive body heat and sweating"],
    balanceTips: ["Cooling herbs such as Chandana, Brahmi and Amalaki", "Calm work routines without overexertion", "Moonlight walks, spending time in nature & cool lakes", "Avoid spicy, sour, fermented, fried and overly salty foods"],
    bestFoods: ["Sweet cooling fruits", "Coconut water", "Ghee & butter", "Coriander & mint"],
  },
  kapha: {
    name: "Kapha",
    elements: "Earth & Water (Prithvi & Jala)",
    icon: Mountain,
    tagline: "The Energy of Structure & Cohesion",
    personality: "Kapha individuals are grounded, affectionate, calm, patient, and deeply loyal. They possess strong immunity, stamina, and smooth radiant skin.",
    imbalanceSigns: ["Sluggish metabolism, easy weight gain", "Chronic sinus congestion, excess mucus", "Lethargy, daytime sleepiness, heaviness", "Resistance to change, emotional attachment"],
    balanceTips: ["Vigorous daily physical exercise (Vyayama)", "Warm, light, dry and spiced meals", "Dry powder massage (Udvartana)", "Avoid heavy sweets, dairy, excessive oily foods and afternoon naps"],
    bestFoods: ["Pungent spices (ginger, black pepper)", "Leafy green vegetables", "Barley & millets", "Warm honey water"],
  },
};

export const galleryItems: GalleryItem[] = [];

export const reviews: Review[] = [];

export const faqs = [
  { q: "Is Panchakarma safe for everyone?", a: "Panchakarma is completely safe when customized by a qualified Ayurvedic doctor. It is never administered generically. During your initial consultation, your Vaidya determines which therapies, durations, and medicated oils suit your age, current vitality, and specific constitution." },
  { q: "How long does an Ayurvedic treatment course typically take?", a: "It depends directly on whether you are seeking preventive rejuvenation or treating a chronic condition (such as arthritis or stubborn psoriasis). Shorter detox plans may last 7 to 14 days, while deep chronic conditions may require a focused therapy course followed by 2 to 3 months of supportive herbal medicine and dietary care." },
  { q: "Do I need to book an appointment in advance?", a: "Yes, prior booking is strongly advised. Because our doctor spends dedicated 1-on-1 time for in-depth Nadi Pariksha (pulse analysis) and health history, prior scheduling ensures zero waiting time and personal care." },
  { q: "Are there dietary restrictions during treatment?", a: "Yes, simple Ayurvedic dietary guidance (Pathya) is recommended during Panchakarma. Fresh, warm, light, and easily digestible vegetarian foods support your digestive fire (Agni) so toxins (Ama) can be efficiently eliminated." },
  { q: "Are your Ayurvedic medicines pure and chemical-free?", a: "Absolutely. All formulations prescribed at Charak Ayurveda are 100% herbal, classical Vedic preparations, and therapeutic decoctions. They are thoroughly tested, non-habit forming, and free from synthetic additives." },
];

export const treatmentCategories = [
  {
    title: "1. PANCHAKARMA",
    image: "/images/treatments/panchakarma.jpg",
    summary: "Authentic classical Panchakarma therapies and residential rejuvenating Ayurvedic retreat programs to cleanse cellular toxins and reboot vitality.",
    conditions: [
      "Panchakarma (Classical 5-fold detoxification)",
      "Ayurvedic retreat (5 day / 7 day intensive wellness programs)",
    ],
    treatments: "Vamana, Virechana, Basti, Nasya, Raktamokshana, Abhyanga & Swedana.",
  },
  {
    title: "2. BODY PAIN",
    image: "/images/treatments/body-pain.jpg",
    summary: "Targeted Ayurvedic pain rehabilitation to lubricate joints, soothe inflamed nerves, and restore pain-free spine and joint movement.",
    conditions: [
      "Back pain",
      "Sciatica",
      "Knee pain",
      "Neck and shoulder pain",
      "Cervical spondylitis",
      "Slip disc",
      "Frozen shoulder",
      "Arthritis and joint pain",
    ],
    treatments: "Janu Basti, Kati Basti, Greeva Basti, Patra Pinda Sweda, medicated anti-inflammatory herbal oils.",
  },
  {
    title: "3. SKIN",
    image: "/images/treatments/skincare.jpg",
    summary: "Treating the internal root cause by cooling Rakta-Pitta, detoxifying liver and blood, and restoring radiant scalp and skin health.",
    conditions: [
      "Psoriasis",
      "Eczema",
      "Skin allergy",
      "Acne and scars",
      "Fungal infection",
      "Hair fall",
      "Dandruff",
      "Vitiligo",
    ],
    treatments: "Blood purification decoctions, herbal Lepa, Takradhara, and strict constitutional Pathya diet.",
  },
  {
    title: "4. WOMEN'S HEALTH",
    image: "/images/treatments/womens-health.jpg",
    summary: "Natural reproductive organ nourishment, menstrual cycle normalization, and hormonal equilibrium through gentle Ayurvedic therapies.",
    conditions: [
      "PCOS",
      "PCOD",
      "Irregular periods",
      "Painful periods",
      "Infertility",
      "Tubal block",
    ],
    treatments: "Uttar Basti, hormonal balancing rasayanas, specialized detox, and Garbha Samskara guidance.",
  },
  {
    title: "5. STOMACH AND DIGESTION",
    image: "/images/treatments/digestion.jpg",
    summary: "Kindling the digestive fire (Jatharagni) to clear gut toxins (Ama) and permanently resolve gastrointestinal dysfunctions.",
    conditions: [
      "Acidity and gas",
      "Constipation",
      "IBS (Irritable Bowel Syndrome)",
      "Bloating and indigestion",
      "Piles, fissure, fistula",
      "Fatty liver",
    ],
    treatments: "Digestive herbs (Deepana-Pachana), Takra therapies, custom dietary protocols, and metabolic detoxification.",
  },
  {
    title: "6. STRESS AND LIFESTYLE",
    image: "/images/treatments/stress-lifestyle.jpg",
    summary: "Calming an overstimulated nervous system, regulating metabolic balance, and managing chronic modern lifestyle disorders.",
    conditions: [
      "Insomnia",
      "Stress and anxiety",
      "Migraine",
      "Obesity",
      "Thyroid",
      "Diabetes",
    ],
    treatments: "Shirodhara with medicated herbal oils, Nasya, Medhya Rasayanas, and personalized Dinacharya guidance.",
  },
];

export const approachPillars = [
  { icon: Stethoscope, title: "1. Classical Nadi Pariksha (Pulse Diagnosis)", desc: "Before prescribing a single herb, we examine your radial pulse to identify micro-imbalances in Vata, Pitta, and Kapha, cellular toxicity (Ama), and organ stress." },
  { icon: HeartHandshake, title: "2. Kindling Agni (Digestive Fire)", desc: "In Charaka Samhita, almost all diseases originate from impaired Agni (Mandagni). We restore your metabolic power so food nourishes your tissues rather than generating toxins." },
  { icon: ShieldCheck, title: "3. Pure & Unadulterated Herbal Formulations", desc: "All medicated oils, decoctions, and herbal churnas used at our center are authentic classical preparations, completely free from steroids, heavy metal adulterants, or chemical additives." },
  { icon: UserCheck, title: "4. Mind-Body Integration (Satvavajaya)", desc: "Physical ailments frequently have emotional and stress triggers. Our doctor provides compassionate counsel, stress-calming therapies, and lifestyle balance." },
];

export const journeySteps = [
  { num: "1", icon: Stethoscope, title: "Consult", subtitle: "In-depth Diagnostics", desc: "Nadi Pariksha (classical pulse diagnosis), Prakriti assessment, and detailed discussion of lifestyle, emotional patterns, and root causes." },
  { num: "2", icon: ClipboardCheck, title: "Plan", subtitle: "Custom Treatment Roadmap", desc: "A personalized treatment prescription including medicinal herbs, internal detox protocols, customized dietary recommendations, and daily dinacharya." },
  { num: "3", icon: Flower2, title: "Treat", subtitle: "Authentic Therapies", desc: "Therapies performed by skilled Ayurvedic practitioners using classical medicated oils, herbal decoctions, steam chambers, and tailored Panchakarma." },
  { num: "4", icon: HeartHandshake, title: "Sustain", subtitle: "Lifelong Vitality", desc: "Ongoing follow-ups, seasonal rasayana (rejuvenation) tonics, and preventive health advice so your body maintains enduring harmony and balance." },
];

export const stats = [
  { num: "6", label: "Speciality Care Areas" },
  { num: "100%", label: "Herbal Formulations" },
  { num: "1 : 1", label: "Personalized Consultation" },
  { num: "5", label: "Panchakarma Therapies" },
];

export const approachHighlights = [
  { title: "Honest Diagnostics & Clear Guidance", desc: "No unnecessary medicines or exaggerated promises. Transparent consultations focusing on the true root cause.", icon: ShieldCheck },
  { title: "Pure Herbal Formulations & Classical Oils", desc: "We prepare and source potent classical Ayurvedic oils and herbal rasayanas free from synthetic additives.", icon: HeartHandshake },
  { title: "Serene & Private Therapeutic Space", desc: "A calm, hygienic sanctuary designed to quiet sensory overload and promote deep physiological rest.", icon: UserCheck },
  { title: "Conveniently Located in Vidyavihar, Pilani", desc: "Situated right beside Birla Hospital in Shyam Vatika, easily accessible with peaceful surroundings.", icon: MapPin },
];

export const quizQuestions = [
  { q: "How does your skin usually feel?", opts: [{ label: "Dry, rough or cool to touch", dosha: "vata" }, { label: "Warm, sensitive, prone to redness/acne", dosha: "pitta" }, { label: "Soft, smooth, oily or cool", dosha: "kapha" }] },
  { q: "How is your digestion and appetite?", opts: [{ label: "Irregular, variable, prone to gas/bloating", dosha: "vata" }, { label: "Strong, sharp hunger, irritable if meal delayed", dosha: "pitta" }, { label: "Slow, steady, can easily skip meals", dosha: "kapha" }] },
  { q: "When stressed, how do you tend to react?", opts: [{ label: "Worry, anxiety, restless overthinking", dosha: "vata" }, { label: "Frustration, anger, impatience", dosha: "pitta" }, { label: "Withdrawal, stubbornness, procrastination", dosha: "kapha" }] },
];
