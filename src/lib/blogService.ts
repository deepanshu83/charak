import type { Blog } from "@/types";
import type { Database } from "@/types/database.types";
import { getPublicSupabaseClient } from "./supabaseClient";

const EVENT_NAME = "charak_blogs_updated";

let runtimeBlogsCache: UnifiedBlog[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifySubscribers(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export interface UnifiedBlog extends Blog {
  content: string[];
  featuredImage?: string;
  storagePath?: string;
  published?: boolean;
  publishedAt?: string | null;
}

function mapDbBlogToBlog(row: Database["public"]["Tables"]["blogs"]["Row"]): UnifiedBlog {
  const paragraphs = row.content ? row.content.split("\n\n").filter(Boolean) : [];
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    category: row.category || "Ayurvedic Care",
    author: row.author || "Charak Medical Team",
    date: row.published_at
      ? new Date(row.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Draft",
    readTime: row.read_time || "4 min read",
    body: paragraphs,
    content: paragraphs,
    featuredImage: row.featured_image || undefined,
    storagePath: row.storage_path || undefined,
    published: row.published,
    publishedAt: row.published_at,
  };
}

export const DEFAULT_BLOGS: UnifiedBlog[] = [
  {
    id: "b1",
    title: "Understanding Tridoshas: Vata, Pitta, and Kapha",
    slug: "understanding-tridoshas-vata-pitta-kapha",
    excerpt:
      "Discover how the three biological humors govern physical constitution, metabolic fire, and emotional equilibrium in classical Ayurveda.",
    category: "Tridoshas & Prakriti",
    author: "Dr. Rajesh Sharma",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    featuredImage: "/images/g3.jpg",
    published: true,
    publishedAt: "2026-10-10T10:00:00Z",
    body: [
      "According to the classical teachings of Acharya Charak in the Charaka Samhita, every individual is born with a unique constitutional blueprint termed Prakriti. This balance is governed by three vital energies known as Tridoshas: Vata, Pitta, and Kapha.",
      "Vata is composed of space and air. It governs all bodily movement, respiration, nerve impulses, and circulation. When in equilibrium, Vata brings creativity, enthusiasm, and alertness. When aggravated by cold weather or stress, it manifests as dry skin, constipation, anxiety, and joint stiffness.",
      "Pitta represents the transformational forces of fire and water. It controls digestion (Agni), metabolism, cellular nutrition, and body temperature. Balanced Pitta yields sharp intellect, courage, and glowing skin, while aggravated Pitta causes acid reflux, skin eruptions, and inflammatory conditions.",
      "Kapha embodies earth and water, providing biological cohesion, structural stability, joint lubrication, and immunity (Ojas). While balanced Kapha grants calmness and immense physical endurance, excess Kapha leads to lethargy, fluid retention, congestion, and slow digestion.",
      "At Charak Ayurveda in Pilani, our senior Vaidyas utilize precise Nadi Pariksha (classical pulse assessment) to identify your dominant dosha and subtle cellular imbalances before designing personalized herbal therapies.",
    ],
    content: [
      "According to the classical teachings of Acharya Charak in the Charaka Samhita, every individual is born with a unique constitutional blueprint termed Prakriti. This balance is governed by three vital energies known as Tridoshas: Vata, Pitta, and Kapha.",
      "Vata is composed of space and air. It governs all bodily movement, respiration, nerve impulses, and circulation. When in equilibrium, Vata brings creativity, enthusiasm, and alertness. When aggravated by cold weather or stress, it manifests as dry skin, constipation, anxiety, and joint stiffness.",
      "Pitta represents the transformational forces of fire and water. It controls digestion (Agni), metabolism, cellular nutrition, and body temperature. Balanced Pitta yields sharp intellect, courage, and glowing skin, while aggravated Pitta causes acid reflux, skin eruptions, and inflammatory conditions.",
      "Kapha embodies earth and water, providing biological cohesion, structural stability, joint lubrication, and immunity (Ojas). While balanced Kapha grants calmness and immense physical endurance, excess Kapha leads to lethargy, fluid retention, congestion, and slow digestion.",
      "At Charak Ayurveda in Pilani, our senior Vaidyas utilize precise Nadi Pariksha (classical pulse assessment) to identify your dominant dosha and subtle cellular imbalances before designing personalized herbal therapies.",
    ],
  },
  {
    id: "b2",
    title: "The Science of Panchakarma: Classical 5-Fold Detoxification",
    slug: "science-of-panchakarma-classical-detox",
    excerpt:
      "Why authentic seasonal detoxification and cellular metabolic renewal (Shodhana) is the cornerstone of Ayurvedic wellness.",
    category: "Panchakarma",
    author: "Dr. Rajesh Sharma",
    date: "Oct 08, 2026",
    readTime: "6 min read",
    featuredImage: "/images/panchkaram.jpeg",
    published: true,
    publishedAt: "2026-10-08T10:00:00Z",
    body: [
      "In classical Ayurvedic pathology, disease takes root when undigested metabolic waste, termed Ama, circulates through the bodily channels (Srotas) and lodges within weakened tissues (Dhatus). Over years, Ama solidifies and obstructs vitality.",
      "While ordinary dietary cleanses only skim the surface, Panchakarma is an exhaustive, five-fold scientific protocol formulated to loosen, liquefy, and expel deep-seated cellular toxins from their biological roots.",
      "The process begins with Purvakarma (preparatory therapy), comprising Snehana (internal and external oleation with medicated oils) and Swedana (herbal steam therapy). These procedures soften stubborn toxins and gently guide them back toward the gastrointestinal tract for safe expulsion.",
      "Next, depending on the patient's individual constitution and ailment, the appropriate Pradhanakarma (main cleansing) procedures are administered under clinical supervision: Vamana (emesis), Virechana (purgation), Basti (medicated enemas), Nasya (nasal administration), and Raktamokshana (blood purification).",
      "The journey concludes with Paschatkarma (rejuvenation), which rekindles metabolic Agni through customized Rasayana nutrition. Patients emerge with revitalized energy, glowing skin, improved immunity, and profound mental clarity.",
    ],
    content: [
      "In classical Ayurvedic pathology, disease takes root when undigested metabolic waste, termed Ama, circulates through the bodily channels (Srotas) and lodges within weakened tissues (Dhatus). Over years, Ama solidifies and obstructs vitality.",
      "While ordinary dietary cleanses only skim the surface, Panchakarma is an exhaustive, five-fold scientific protocol formulated to loosen, liquefy, and expel deep-seated cellular toxins from their biological roots.",
      "The process begins with Purvakarma (preparatory therapy), comprising Snehana (internal and external oleation with medicated oils) and Swedana (herbal steam therapy). These procedures soften stubborn toxins and gently guide them back toward the gastrointestinal tract for safe expulsion.",
      "Next, depending on the patient's individual constitution and ailment, the appropriate Pradhanakarma (main cleansing) procedures are administered under clinical supervision: Vamana (emesis), Virechana (purgation), Basti (medicated enemas), Nasya (nasal administration), and Raktamokshana (blood purification).",
      "The journey concludes with Paschatkarma (rejuvenation), which rekindles metabolic Agni through customized Rasayana nutrition. Patients emerge with revitalized energy, glowing skin, improved immunity, and profound mental clarity.",
    ],
  },
  {
    id: "b3",
    title: "Dinacharya: Sacred Daily Routines for Lifelong Health",
    slug: "dinacharya-sacred-daily-routines-for-health",
    excerpt:
      "Simple, time-tested morning and evening rituals to harmonize your circadian rhythm and ignite lasting vitality.",
    category: "Daily Routine",
    author: "Dr. Rajesh Sharma",
    date: "Oct 04, 2026",
    readTime: "4 min read",
    featuredImage: "/images/g4.jpg",
    published: true,
    publishedAt: "2026-10-04T10:00:00Z",
    body: [
      "Dinacharya—literally 'following the rhythm of the day'—is one of Ayurveda's greatest gifts for preventive healthcare. The ancient sages recognized that our bodies are miniature reflections of the cosmos, influenced by the natural cycles of sunrise, solar peak, and twilight.",
      "Rising during the Brahma Muhurta (approximately 45 to 60 minutes before dawn) infuses the mind with pristine Sattva and tranquility. Starting the day by drinking a glass of warm water, gently scraping the tongue (Jihwa Nirlekhana), and oil pulling (Gandusha) expels oral toxins accumulated overnight.",
      "Abhyanga—the daily practice of massaging warm sesame or medicated herbal oil into the skin before bathing—nourishes the nervous system, stimulates lymphatic drainage, tones muscle tissues, and delays cellular aging.",
      "Consuming the heaviest meal of the day between 12:00 PM and 1:30 PM, when the sun is highest and digestive fire (Pitta) is at its peak, ensures complete digestion and prevents Ama accumulation.",
      "By anchoring our days in these rhythmic, mindful rituals, we insulate our bodies from chronic stress and foster vibrant physical resilience.",
    ],
    content: [
      "Dinacharya—literally 'following the rhythm of the day'—is one of Ayurveda's greatest gifts for preventive healthcare. The ancient sages recognized that our bodies are miniature reflections of the cosmos, influenced by the natural cycles of sunrise, solar peak, and twilight.",
      "Rising during the Brahma Muhurta (approximately 45 to 60 minutes before dawn) infuses the mind with pristine Sattva and tranquility. Starting the day by drinking a glass of warm water, gently scraping the tongue (Jihwa Nirlekhana), and oil pulling (Gandusha) expels oral toxins accumulated overnight.",
      "Abhyanga—the daily practice of massaging warm sesame or medicated herbal oil into the skin before bathing—nourishes the nervous system, stimulates lymphatic drainage, tones muscle tissues, and delays cellular aging.",
      "Consuming the heaviest meal of the day between 12:00 PM and 1:30 PM, when the sun is highest and digestive fire (Pitta) is at its peak, ensures complete digestion and prevents Ama accumulation.",
      "By anchoring our days in these rhythmic, mindful rituals, we insulate our bodies from chronic stress and foster vibrant physical resilience.",
    ],
  },
];

/**
 * Public asynchronous fetch from Supabase for published blogs.
 */
export async function fetchBlogs(): Promise<UnifiedBlog[]> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return runtimeBlogsCache.length > 0 ? runtimeBlogsCache : DEFAULT_BLOGS;
    }

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return runtimeBlogsCache.length > 0 ? runtimeBlogsCache : DEFAULT_BLOGS;
    }

    const mapped = data.map(mapDbBlogToBlog);
    runtimeBlogsCache = mapped;
    return mapped;
  } catch {
    return runtimeBlogsCache.length > 0 ? runtimeBlogsCache : DEFAULT_BLOGS;
  }
}

export async function fetchBlogBySlug(slug: string): Promise<UnifiedBlog | null> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      const cached = runtimeBlogsCache.find((b) => b.slug === slug || b.id === slug);
      if (cached) return cached;
      return DEFAULT_BLOGS.find((b) => b.slug === slug || b.id === slug) || null;
    }

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !data) {
      const cached = runtimeBlogsCache.find((b) => b.slug === slug || b.id === slug);
      if (cached) return cached;
      return DEFAULT_BLOGS.find((b) => b.slug === slug || b.id === slug) || null;
    }

    return mapDbBlogToBlog(data);
  } catch {
    return DEFAULT_BLOGS.find((b) => b.slug === slug || b.id === slug) || null;
  }
}

// ----------------------------------------------------------------------------
// Admin CRUD Operations for Blogs
// ----------------------------------------------------------------------------

export async function fetchAdminBlogs(): Promise<UnifiedBlog[]> {
  if (!isBrowser()) return runtimeBlogsCache;
  try {
    const res = await fetch("/api/admin/blogs", {
      credentials: "include",
      headers: {
        "x-admin-auth": "authenticated_admin",
      },
    });
    const json = await res.json().catch(() => ({}));
    if (json.ok && Array.isArray(json.data)) {
      const mapped = json.data.map(mapDbBlogToBlog);
      runtimeBlogsCache = mapped;
      return mapped;
    }
    return [];
  } catch (err) {
    console.error("[Admin Blogs API] fetch failed:", err);
    return [];
  }
}

export async function adminCreateBlog(input: {
  title: string;
  slug?: string;
  excerpt: string;
  content: string | string[];
  category?: string;
  author?: string;
  readTime?: string;
  featuredImage?: string;
  storagePath?: string;
  published?: boolean;
  publishedAt?: string;
}): Promise<UnifiedBlog> {
  const contentStr = Array.isArray(input.content)
    ? input.content.join("\n\n")
    : input.content;

  const res = await fetch("/api/admin/blogs", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
    body: JSON.stringify({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: contentStr,
      category: input.category,
      author: input.author,
      readTime: input.readTime,
      featuredImage: input.featuredImage,
      storagePath: input.storagePath,
      published: input.published,
      publishedAt: input.publishedAt,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to create blog in database");
  }

  const created = mapDbBlogToBlog(json.data);
  runtimeBlogsCache = [created, ...runtimeBlogsCache.filter((b) => b.id !== created.id)];
  notifySubscribers();
  return created;
}

export async function adminUpdateBlog(
  id: string,
  changes: Partial<UnifiedBlog> & { content?: string | string[]; storagePath?: string }
): Promise<UnifiedBlog> {
  const payload: Record<string, unknown> = { id, ...changes };
  if (Array.isArray(changes.content)) {
    payload.content = changes.content.join("\n\n");
  }

  const res = await fetch("/api/admin/blogs", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-auth": "authenticated_admin",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.error || "Failed to update blog in database");
  }

  const updated = mapDbBlogToBlog(json.data);
  runtimeBlogsCache = runtimeBlogsCache.map((b) => (b.id === id ? updated : b));
  notifySubscribers();
  return updated;
}

export async function adminDeleteBlog(id: string): Promise<void> {
  const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "x-admin-auth": "authenticated_admin",
    },
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to delete blog in database");
  }

  runtimeBlogsCache = runtimeBlogsCache.filter((b) => b.id !== id);
  notifySubscribers();
}

// ----------------------------------------------------------------------------
// Synchronous Cache Access (Backed only by active runtime cache, no mock data)
// ----------------------------------------------------------------------------

export function getBlogs(): UnifiedBlog[] {
  return runtimeBlogsCache;
}

export function getBlogBySlug(slug: string): UnifiedBlog | undefined {
  return runtimeBlogsCache.find((b) => b.slug === slug || b.id === slug);
}

export function subscribeBlogs(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
}
