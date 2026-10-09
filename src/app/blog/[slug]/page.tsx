import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { fetchBlogBySlug, fetchBlogs } from "@/lib/blogService";
import { Clock, Calendar, ArrowLeft, CalendarCheck } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const blogs = await fetchBlogs().catch(() => []);
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Charak Ayurveda",
    };
  }

  return {
    title: `${post.title} | Charak Ayurveda`,
    description: post.excerpt,
    alternates: {
      canonical: `https://charakayurvedapilani.com/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://charakayurvedapilani.com/blog/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author || "Charak Medical Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Charak Ayurveda",
      logo: {
        "@type": "ImageObject",
        url: "https://charakayurvedapilani.com/images/ourApproach.jpeg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://charakayurvedapilani.com/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Article Header & Breadcrumbs */}
        <section style={{ background: "rgba(24, 66, 50, 0.04)", padding: "50px 0 36px" }}>
          <div className="wrap">
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <Link
                href="/blog"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.88rem",
                  color: "var(--terra)",
                  fontWeight: 500,
                  marginBottom: "20px",
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to All Articles</span>
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "rgba(194, 139, 56, 0.15)",
                    color: "var(--gold-hover)",
                    padding: "4px 14px",
                    borderRadius: "20px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {post.category}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--ink-muted)" }}>
                  <Calendar size={14} />
                  <span>{post.date}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--ink-muted)" }}>
                  <Clock size={14} />
                  <span>{post.readTime}</span>
                </div>
              </div>

              <h1 style={{ fontSize: "clamp(2.1rem, 4.5vw, 3.2rem)", lineHeight: 1.15, marginBottom: "16px" }}>
                {post.title}
              </h1>

              <p style={{ color: "var(--ink-light)", fontSize: "1.15rem", lineHeight: 1.6, fontStyle: "italic" }}>
                &ldquo;{post.excerpt}&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Article Body */}
        <article style={{ padding: "50px 0 80px" }}>
          <div className="wrap">
            <div
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                background: "#ffffff",
                padding: "48px 40px",
                borderRadius: "24px",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {post.featuredImage && (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "360px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    marginBottom: "32px",
                  }}
                >
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 800px) 100vw, 800px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                {post.content.map((paragraph, index) => (
                  <p
                    key={index}
                    style={{
                      fontSize: "1.08rem",
                      lineHeight: 1.8,
                      color: "var(--ink)",
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Author & Clinic Signature */}
              <div
                style={{
                  marginTop: "48px",
                  paddingTop: "28px",
                  borderTop: "1px solid rgba(24, 66, 50, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--green)", fontSize: "1.05rem" }}>
                    Charak Ayurveda Medical Team
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--ink-muted)" }}>
                    Beside Birla Hospital, Vidyavihar, Pilani, Rajasthan
                  </div>
                </div>

                <Link href="/appointment" className="btn sm gold">
                  <CalendarCheck size={16} />
                  Consult Our Doctor
                </Link>
              </div>
            </div>

            {/* Read More Blogs Widget */}
            <div style={{ maxWidth: "800px", margin: "48px auto 0", textAlign: "center" }}>
              <Link href="/blog" className="btn ghost sm">
                <ArrowLeft size={16} />
                Explore Other Ayurveda Articles
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
