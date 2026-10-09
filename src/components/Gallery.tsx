"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchGalleryItems } from "@/lib/galleryService";

interface GalleryCard {
  id: string;
  cat: "therapy" | "clinic" | "herbs" | string;
  image: string;
  alt: string;
}

const DEFAULT_GALLERY: GalleryCard[] = [
  { id: "g1", cat: "therapy", image: "/images/g1.jpg", alt: "Panchakarma therapy" },
  { id: "g2", cat: "clinic", image: "/images/g2.jpg", alt: "Clinic sanctuary" },
  { id: "g3", cat: "herbs", image: "/images/g3.jpg", alt: "Classical Ayurvedic herbs" },
  { id: "g4", cat: "therapy", image: "/images/g4.jpg", alt: "Therapeutic massage" },
  { id: "g5", cat: "clinic", image: "/images/g5.jpg", alt: "Herbal dispensary" },
];

export default function Gallery() {
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

  const filtered = items.filter((item) => filter === "all" || item.cat === filter);

  return (
    <section className="wrap" id="gallery">
      <div className="head">
        <span className="tag">Gallery</span>
        <h2>A glimpse of Charak</h2>
      </div>

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

      <div className="ggrid" id="ggrid">
        {filtered.map((item) => (
          <figure
            key={item.id}
            className="g"
            data-cat={item.cat}
            onClick={() => setActiveImage(item.image)}
          >
            <Image
              src={item.image}
              alt={item.alt}
              width={300}
              height={400}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </figure>
        ))}
      </div>

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
