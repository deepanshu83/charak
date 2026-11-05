"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import { fetchPatientStories } from "@/lib/patientStoryService";

interface ReviewItem {
  id: string;
  quote: string;
  author: string;
  image?: string;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    quote: "My joint pain reduced a lot after the Panchakarma course. The doctor explains everything clearly.",
    author: "Suman Sharma, Pilani",
  },
  {
    id: "rev-2",
    quote: "Years of skin trouble improved with natural treatment and diet advice.",
    author: "Aman Kumar, Vidyavihar",
  },
  {
    id: "rev-3",
    quote: "Supportive guidance and a peaceful atmosphere throughout our journey.",
    author: "Neha Pareek, Jhunjhunu",
  },
  {
    id: "rev-4",
    quote: "Effective Ayurvedic therapies for chronic cervical pain. Highly recommended hospital in Shekhawati.",
    author: "Vikram Shekhawat, Chirawa",
  },
  {
    id: "rev-5",
    quote: "The authentic Nadi Pariksha and herbal rasayanas helped restore my digestive wellness completely.",
    author: "Priya Goyal, Pilani",
  },
];

const GOOGLE_BUSINESS_REVIEWS_URL =
  "https://www.google.com/maps/place/Charak+Ayurveda+Panchakarma+Skin+Care,+Joint+Care+And+Infertility+Center/@28.3579064,75.6050713,17z/data=!4m8!3m7!1s0x3913195b99bca2db:0xaed2af1856272386!8m2!3d28.3579064!4d75.6050713!9m1!1b1!16s%2Fg%2F11gfm8c7_q";

interface ReviewsProps {
  showHeader?: boolean;
  style?: React.CSSProperties;
}

export default function Reviews({ showHeader = true, style }: ReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);
  const [isLiveContent, setIsLiveContent] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const remote = await fetchPatientStories();
        if (isMounted && remote && remote.length > 0) {
          setReviews(
            remote.map((r) => ({
              id: r.id,
              quote: r.quote,
              author: `${r.name}, ${r.location || "Pilani"}`,
              image: r.image,
            }))
          );
          setIsLiveContent(true);
        }
      } catch (err) {
        console.warn("[Reviews] Notice loading from database:", err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="wrap" id="reviews" style={style}>
      {showHeader && (
        <div className="head">
          <span className="tag">Patient stories</span>
          <h2>Healing, in their words</h2>
        </div>
      )}
      <div className="rgrid">
        {reviews.map((r) => (
          <blockquote key={r.id} className="review-card">
            {r.image && (
              <Image
                src={r.image}
                alt={`${r.author.split(",")[0]} testimonial`}
                width={56}
                height={56}
                unoptimized={r.image.startsWith("http") || r.image.startsWith("/uploads")}
                className="review-patient-photo"
              />
            )}
            <span className="review-stars" aria-label="5 out of 5 stars">
              ★★★★★
            </span>
            <p className="review-quote">{r.quote}</p>
            <cite>{r.author}</cite>
          </blockquote>
        ))}
      </div>

      {/* Google Business Reviews Banner */}
      <div
        style={{
          marginTop: "40px",
          background: "linear-gradient(145deg, #ffffff 0%, var(--cream-card, #fbf8f3) 100%)",
          border: "1.5px solid #e7dfd3",
          borderRadius: "20px",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {/* Google Logo / Icon */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {/* Google colored G svg */}
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
              <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--green)" }}>
                4.9 Rating on Google Business
              </span>
              <div style={{ display: "flex", color: "#f59e0b" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" />
                ))}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink-light)" }}>
              Charak Ayurveda Panchakarma, Skin & Joint Care Hospital, Pilani
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a
            href={GOOGLE_BUSINESS_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "#ffffff",
              color: "var(--green)",
              border: "1.5px solid var(--border)",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "0.88rem",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--green)";
              e.currentTarget.style.background = "#fffdf9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            <span>Read All Google Reviews</span>
            <ExternalLink size={14} />
          </a>

          <a
            href={GOOGLE_BUSINESS_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              background: "var(--green)",
              color: "#ffffff",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "0.88rem",
              textDecoration: "none",
              boxShadow: "0 2px 10px rgba(24, 66, 50, 0.15)",
            }}
          >
            <Star size={14} fill="#ffffff" />
            <span>Write a Review</span>
          </a>
        </div>
      </div>

      {!isLiveContent && (
        <p className="note" style={{ marginTop: "16px" }}>
          *Real patient experiences shared with clinical consent. You can also view verified patient reviews directly on our Google Business listing.
        </p>
      )}
    </section>
  );
}
