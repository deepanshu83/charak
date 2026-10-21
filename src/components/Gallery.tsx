"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchGalleryItems } from "@/lib/galleryService";

interface GalleryCard {
  id: string;
  cat: "therapy" | "clinic" | "herbs" | string;
  image: string;
  alt: string;
}

interface GalleryProps {
  limit?: number;
  showTabs?: boolean;
  showViewMore?: boolean;
}

const DEFAULT_GALLERY: GalleryCard[] = [];

export default function Gallery({
  limit,
  showTabs = true,
  showViewMore = false,
}: GalleryProps = {}) {
  const [items, setItems] = useState<GalleryCard[]>(DEFAULT_GALLERY);
  const [filter, setFilter] = useState<string>("all");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const remote = await fetchGalleryItems();
        if (isMounted && remote && remote.length > 0) {
          setItems(
            remote.map((item) => ({
              id: item.id,
              cat: item.category,
              image: item.image,
              alt: item.caption || item.title,
            }))
          );
        } else if (isMounted) {
          setItems([]);
        }
      } catch (err) {
        console.warn("[Gallery] Notice loading from database:", err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // If on home page and no photos uploaded yet, hide gallery section cleanly
  if (showViewMore && items.length === 0) {
    return null;
  }

  const filtered = items.filter((item) => filter === "all" || item.cat === filter);
  const displayedItems = limit ? filtered.slice(0, limit) : filtered;

  return (
    <section className="wrap" id="gallery">
      <div className="head">
        <span className="tag">Gallery</span>
        <h2>A glimpse of Charak</h2>
      </div>

      {showTabs && (
        <div className="gtabs" id="gtabs">
          <button
            className={filter === "all" ? "on" : ""}
            onClick={() => setFilter("all")}
            type="button"
          >
            All
          </button>
          <button
            className={filter === "therapy" ? "on" : ""}
            onClick={() => setFilter("therapy")}
            type="button"
          >
            Therapies
          </button>
          <button
            className={filter === "clinic" ? "on" : ""}
            onClick={() => setFilter("clinic")}
            type="button"
          >
            Clinic
          </button>
          <button
            className={filter === "herbs" ? "on" : ""}
            onClick={() => setFilter("herbs")}
            type="button"
          >
            Herbs
          </button>
        </div>
      )}

      {displayedItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "54px 20px",
            background: "var(--cream-card)",
            borderRadius: "20px",
            border: "1px dashed var(--border)",
            maxWidth: "560px",
            margin: "0 auto",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", marginBottom: "8px", color: "var(--green)" }}>
            New photographs coming soon
          </h3>
          <p style={{ color: "var(--ink-light)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Our clinic healing spaces, Panchakarma therapy suites, and herbal dispensary photographs are currently being updated.
          </p>
        </div>
      ) : (
        <div className="ggrid" id="ggrid">
          {displayedItems.map((item) => (
            <figure
              key={item.id}
              className="g"
              data-cat={item.cat}
              onClick={() => setActiveImage(item.image)}
            >
              <Image
                src={item.image}
                alt={item.alt}
                width={500}
                height={375}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      )}

      {showViewMore && (
        <div style={{ textAlign: "center", marginTop: "36px" }}>
          <Link href="/gallery" className="btn sm">
            <span>View More Photos</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {activeImage && (
        <div className="lb open" onClick={() => setActiveImage(null)}>
          <button className="lb-x" onClick={() => setActiveImage(null)} type="button">
            ✕
          </button>
          <Image
            src={activeImage}
            alt="Enlarged view"
            width={1200}
            height={900}
            style={{ maxWidth: "100%", maxHeight: "85vh", width: "auto", height: "auto", borderRadius: "10px", objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
