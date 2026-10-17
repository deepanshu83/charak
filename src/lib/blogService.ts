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
import { BLOG_POSTS } from "@/data/blogs";

export const DEFAULT_BLOGS: UnifiedBlog[] = BLOG_POSTS as UnifiedBlog[];


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
