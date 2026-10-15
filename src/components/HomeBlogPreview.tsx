"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { fetchBlogs, DEFAULT_BLOGS, type UnifiedBlog } from "@/lib/blogService";

export default function HomeBlogPreview() {
  const [blogs, setBlogs] = useState<UnifiedBlog[]>(DEFAULT_BLOGS.slice(0, 3));

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchBlogs();
        if (isMounted && data && data.length > 0) {
          setBlogs(data.slice(0, 3));
        }
      } catch (err) {
        console.warn("[HomeBlogPreview] Failed to fetch blogs:", err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="wrap" id="blog">
      <div className="head">
        <span className="tag">Vedic Wisdom</span>
        <h2>From Our Ayurveda Journal</h2>
        <p>
          Clinical insights, seasonal Tridosha guidelines, and time-tested Ayurvedic self-care routines from our medical team.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "28px",
        }}
      >
        {blogs.map((post) => (
          <article
            key={post.slug}
            style={{
              background: "var(--cream-card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {post.featuredImage && (
              <div style={{ position: "relative", width: "100%", height: "200px" }}>
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            )}

            <div style={{ padding: "28px 24px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    background: "rgba(194, 139, 56, 0.12)",
                    color: "var(--gold-hover)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {post.category}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.8rem",
                    color: "var(--ink-muted)",
                  }}
                >
                  <Clock size={13} />
                  <span>{post.readTime}</span>
                </div>
              </div>

              <h3
                style={{
                  fontSize: "1.35rem",
                  marginBottom: "10px",
                  color: "var(--green)",
                  lineHeight: 1.3,
                  fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
                }}
              >
                <Link href={`/blog/${post.slug}`} style={{ color: "inherit" }}>
                  {post.title}
                </Link>
              </h3>

              <p
                style={{
                  color: "var(--ink-light)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  marginBottom: "20px",
                  flexGrow: 1,
                }}
              >
                {post.excerpt}
              </p>

              <div
                style={{
                  borderTop: "1px solid rgba(24, 66, 50, 0.08)",
                  paddingTop: "16px",
                  marginTop: "auto",
                }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="treatment-card-btn"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span>Read Full Article</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link href="/blog" className="btn sm">
          <span>Explore All Articles</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
