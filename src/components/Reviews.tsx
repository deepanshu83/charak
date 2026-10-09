"use client";

import { useEffect, useState } from "react";
import { fetchPatientStories } from "@/lib/patientStoryService";

interface ReviewItem {
  id: string;
  quote: string;
  author: string;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    quote: "My joint pain reduced a lot after the Panchakarma course. The doctor explains everything clearly.",
    author: "Patient, Pilani",
  },
  {
    id: "rev-2",
    quote: "Years of skin trouble improved with natural treatment and diet advice.",
    author: "Patient, Vidyavihar",
  },
  {
    id: "rev-3",
    quote: "Supportive guidance and a peaceful atmosphere throughout our journey.",
    author: "Patient, Jhunjhunu",
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const remote = await fetchPatientStories();
        if (isMounted && remote && remote.length >= 3) {
          setReviews(
            remote.slice(0, 3).map((r) => ({
              id: r.id,
              quote: r.quote,
              author: `${r.name}, ${r.location || "Pilani"}`,
            }))
          );
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
    <section className="wrap" id="reviews">
      <div className="head">
        <span className="tag">Patient stories</span>
        <h2>Healing, in their words</h2>
      </div>
      <div className="rgrid">
        {reviews.map((r) => (
          <blockquote key={r.id}>
            <span>★★★★★</span>
            {r.quote}
            <cite>{r.author}</cite>
          </blockquote>
        ))}
      </div>
      <p className="note">*Sample reviews. Replace with real patient feedback.</p>
    </section>
  );
}
