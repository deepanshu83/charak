import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { fetchBlogs } from "@/lib/blogService";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Ayurveda Health Blogs & Clinical Guides | Charak Ayurveda Pilani",
  description:
    "10 evidence-aware Ayurvedic health guides on Panchakarma, Skin Care, Infertility, Joint Pain, Gut Health, and Stress Management by doctors at Charak Ayurveda Pilani.",
  alternates: {
    canonical: "https://charakayurvedapilani.com/blog",
  },
  openGraph: {
    title: "Ayurveda Health Blogs & Clinical Guides | Charak Ayurveda Pilani",
    description: "Evidence-aware Ayurvedic health guides by senior doctors at Charak Ayurveda Pilani — Panchakarma, Skin, Joints, Fertility, Gut & Stress.",
    url: "https://charakayurvedapilani.com/blog",
    type: "website",
  },
};

export default async function BlogListPage() {
  const posts = await fetchBlogs();

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Page Hero Banner */}
        <section style={{ padding: "60px 0 30px" }}>
          <div className="wrap">
            <div className="head">
              <span className="tag">Vedic Wisdom &amp; Wellness</span>
              <h1>Charak Ayurveda Blog</h1>
              <p>
                Explore classical insights, seasonal health tips, and practical guidelines to integrate timeless Vedic medicine into your modern everyday life.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section style={{ padding: "40px 0 80px" }}>
          <div className="wrap">
            {posts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "var(--cream-card)",
                  borderRadius: "20px",
                  border: "1px dashed var(--border)",
                  maxWidth: "540px",
                  margin: "0 auto",
                }}
              >
                <BookOpen size={48} color="var(--gold)" style={{ margin: "0 auto 16px", opacity: 0.8 }} />
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", color: "var(--green)" }}>
                  No blog posts available yet.
                </h3>
                <p style={{ color: "var(--ink-light)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Our medical team will publish clinical articles on Tridoshas, Panchakarma, and Ayurvedic wellness soon.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "32px",
                }}
              >
                {posts.map((post) => (
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
                            gap: "12px",
                            fontSize: "0.8rem",
                            color: "var(--ink-muted)",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={13} />
                            {post.readTime}
                          </span>
                        </div>
                      </div>

                      {post.author && (
                        <div style={{ fontSize: "0.8rem", color: "var(--terra)", fontWeight: 500, marginBottom: "8px" }}>
                          {post.author}
                        </div>
                      )}

                      <h2
                        style={{
                          fontSize: "1.35rem",
                          marginBottom: "12px",
                          color: "var(--green)",
                          lineHeight: 1.3,
                        }}
                      >
                        <Link href={`/blog/${post.slug}`} style={{ color: "inherit" }}>
                          {post.title}
                        </Link>
                      </h2>

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
                          style={{ display: "inline-flex" }}
                        >
                          <span>Read Full Article</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
