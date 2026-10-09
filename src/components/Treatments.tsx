"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchTreatments } from "@/lib/treatmentService";

interface TreatmentItem {
  num: string;
  title: string;
  desc: string;
  image: string;
}

const DEFAULT_TREATMENTS: TreatmentItem[] = [
  {
    num: "01",
    title: "Panchakarma",
    desc: "Classical five-fold detox to cleanse deep toxins and restore balance.",
    image: "/images/panchkaram.jpeg",
  },
  {
    num: "02",
    title: "Skin Care",
    desc: "Acne, eczema, psoriasis, pigmentation and hair fall, treated from within.",
    image: "/images/skincare.jpeg",
  },
  {
    num: "03",
    title: "Joint Care",
    desc: "Arthritis, back pain and stiffness eased with herbal oils and Basti.",
    image: "/images/joint.png",
  },
  {
    num: "04",
    title: "Infertility Care",
    desc: "Gentle support for male and female fertility, PCOD and hormones.",
    image: "/images/infertility.png",
  },
];

interface TreatmentsProps {
  onSelectConcern?: (concern: string) => void;
}

export default function Treatments({ onSelectConcern }: TreatmentsProps) {
  const [items, setItems] = useState<TreatmentItem[]>(DEFAULT_TREATMENTS);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchTreatments();
        if (isMounted && data && data.length >= 4) {
          setItems(
            data.slice(0, 4).map((t, idx) => ({
              num: String(idx + 1).padStart(2, "0"),
              title: t.name,
              desc: t.shortDescription || t.description,
              image: t.image || DEFAULT_TREATMENTS[idx].image,
            }))
          );
        }
      } catch (err) {
        console.warn("[Treatments] Notice loading from database:", err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleEnquire = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    if (onSelectConcern) {
      onSelectConcern(title);
    }
    const formElement = document.getElementById("contact");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="wrap" id="treatments">
      <div className="head">
        <span className="tag">What we treat</span>
        <h2>Care for body, skin &amp; new beginnings</h2>
      </div>
      <div className="tgrid">
        {items.map((t) => (
          <article key={t.num} className="t">
            <i>{t.num}</i>
            <div className="arch-s">
              <Image
                src={t.image}
                alt={t.title}
                width={300}
                height={150}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </div>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
            <a href="#contact" onClick={(e) => handleEnquire(e, t.title)}>
              Enquire →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
