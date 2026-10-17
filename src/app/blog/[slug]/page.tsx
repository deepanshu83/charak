import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { fetchBlogBySlug, fetchBlogs } from "@/lib/blogService";
import {
  Clock,
  Calendar,
  ArrowLeft,
  CalendarCheck,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  UserCheck,
  Tag,
} from "lucide-react";

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

  const metaTitle = post.metaTitle || `${post.title} | Charak Ayurveda`;
  const metaDescription = post.metaDescription || post.excerpt;
  const keywords = post.secondaryKeywords
    ? [post.primaryKeyword, ...post.secondaryKeywords].filter(Boolean) as string[]
    : undefined;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: `https://charakayurvedapilani.com/blog/${slug}`,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://charakayurvedapilani.com/blog/${slug}`,
      type: "article",
      images: post.featuredImage ? [{ url: post.featuredImage, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      datePublished: post.publishedAt || post.date,
      dateModified: post.publishedAt || post.date,
      author: {
        "@type": "Person",
        name: post.author || "Charak Medical Team",
      },
      publisher: {
        "@type": "Organization",
        name: "Charak Ayurveda & Panchakarma Chikitsalaya",
        logo: {
          "@type": "ImageObject",
          url: "https://charakayurvedapilani.com/images/ourApproach.jpeg",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://charakayurvedapilani.com/blog/${slug}`,
      },
    },
  ];

  if (post.faqs && post.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <Navbar />
      <main style={{ minHeight: "80vh", paddingTop: "20px" }}>
        {/* Article Header & Breadcrumbs */}
        <section style={{ padding: "40px 0 20px" }}>
          <div className="wrap">
            <div style={{ maxWidth: "840px", margin: "0 auto" }}>
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
                <span>Back to All Health Articles</span>
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

                {post.author && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--green)", fontWeight: 600 }}>
                    <UserCheck size={14} color="var(--gold)" />
                    <span>{post.author}</span>
                  </div>
                )}
              </div>

              <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", lineHeight: 1.2, marginBottom: "16px", color: "var(--green)" }}>
                {post.title}
              </h1>

              <p style={{ color: "var(--ink-light)", fontSize: "1.12rem", lineHeight: 1.6, fontStyle: "italic", marginBottom: "20px" }}>
                &ldquo;{post.excerpt}&rdquo;
              </p>

              {/* Primary Focus Keyword Tag */}
              {post.primaryKeyword && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "0.82rem" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--ink-muted)" }}>
                    <Tag size={13} color="var(--gold)" />
                    <b>Focus Keyword:</b>
                  </span>
                  <span style={{ background: "rgba(24, 66, 50, 0.06)", padding: "3px 10px", borderRadius: "12px", color: "var(--green)", fontWeight: 500 }}>
                    {post.primaryKeyword}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Article Body */}
        <article style={{ padding: "30px 0 80px" }}>
          <div className="wrap">
            <div
              style={{
                maxWidth: "840px",
                margin: "0 auto",
                background: "var(--cream-card)",
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
                    height: "380px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    marginBottom: "36px",
                  }}
                >
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 840px) 100vw, 840px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
              )}

              {/* Article Paragraphs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                {(Array.isArray(post.content) ? post.content : [String(post.content || "")]).map((paragraph, index) => (
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

              {/* FAQs Section */}
              {post.faqs && post.faqs.length > 0 && (
                <div
                  style={{
                    marginTop: "48px",
                    paddingTop: "32px",
                    borderTop: "1px solid rgba(24, 66, 50, 0.12)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                    <HelpCircle size={22} color="var(--gold)" />
                    <h3 style={{ fontSize: "1.4rem", color: "var(--green)", margin: 0 }}>
                      Frequently Asked Questions
                    </h3>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {post.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "rgba(255, 255, 255, 0.6)",
                          border: "1px solid var(--border)",
                          borderRadius: "14px",
                          padding: "18px 20px",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "1.05rem",
                            color: "var(--green)",
                            marginBottom: "8px",
                            fontWeight: 600,
                          }}
                        >
                          {faq.q}
                        </h4>
                        <p
                          style={{
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                            color: "var(--ink-light)",
                            margin: 0,
                          }}
                        >
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Services & Internal Links */}
              {post.internalLinks && post.internalLinks.length > 0 && (
                <div
                  style={{
                    marginTop: "36px",
                    padding: "24px",
                    background: "rgba(24, 66, 50, 0.04)",
                    borderRadius: "16px",
                    border: "1px solid rgba(24, 66, 50, 0.08)",
                  }}
                >
                  <h4 style={{ fontSize: "1.08rem", color: "var(--green)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={18} color="var(--gold)" />
                    <span>Related Care &amp; Clinical Consultations</span>
                  </h4>
                  <ul style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: "10px", margin: 0, padding: 0 }}>
                    {post.internalLinks.map((link, idx) => (
                      <li key={idx}>
                        <Link
                          href={link.href}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#ffffff",
                            padding: "8px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                            color: "var(--green)",
                            fontWeight: 600,
                            border: "1px solid var(--border)",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                          }}
                        >
                          <span>{link.label}</span>
                          <ArrowLeft size={13} style={{ transform: "rotate(180deg)" }} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Source References */}
              {post.sources && post.sources.length > 0 && (
                <div
                  style={{
                    marginTop: "32px",
                    paddingTop: "20px",
                    borderTop: "1px dashed rgba(24, 66, 50, 0.12)",
                    fontSize: "0.85rem",
                    color: "var(--ink-muted)",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "8px", color: "var(--green)" }}>
                    Source references for clinical &amp; editorial review:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {post.sources.map((src, idx) => (
                      <li key={idx}>
                        {src.url ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--terra)", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <span>{src.name}</span>
                            <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span>{src.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                    {post.author || "Charak Ayurveda Medical Team"}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--ink-muted)" }}>
                    Beside Birla Hospital, Shyam Vatika, Vidyavihar, Pilani, Rajasthan 333031
                  </div>
                </div>

                <Link href="/appointment" className="btn sm gold">
                  <CalendarCheck size={16} />
                  Book Clinical Consultation
                </Link>
              </div>
            </div>

            {/* Read More Blogs Widget */}
            <div style={{ maxWidth: "840px", margin: "48px auto 0", textAlign: "center" }}>
              <Link href="/blog" className="btn ghost sm">
                <ArrowLeft size={16} />
                Explore All 10 Health Articles
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
