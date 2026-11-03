"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
    quote: "Effective Ayurvedic therapies for chronic cervical pain. Highly recommended clinic in Shekhawati.",
    author: "Vikram Shekhawat, Chirawa",
  },
  {
    id: "rev-5",
    quote: "The authentic Nadi Pariksha and herbal rasayanas helped restore my digestive wellness completely.",
    author: "Priya Goyal, Pilani",
  },
];

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
      {!isLiveContent && (
        <p className="note">*Real patient experiences shared with clinical consent.</p>
      )}
    </section>
  );
}
