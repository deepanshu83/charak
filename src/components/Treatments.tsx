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
    desc: "Classical five-fold detox & 5-day / 7-day rejuvenating Ayurvedic retreats.",
    image: "/images/panchkaram.jpeg",
  },
  {
    num: "02",
    title: "Body Pain & Spine",
    desc: "Relief for back pain, sciatica, knee pain, cervical spondylitis & joint arthritis.",
    image: "/images/joint.png",
  },
  {
    num: "03",
    title: "Skin & Hair Care",
    desc: "Root-cause care for psoriasis, eczema, acne, hair fall, dandruff & vitiligo.",
    image: "/images/skincare.jpeg",
  },
  {
    num: "04",
    title: "Women's Health",
    desc: "Gentle support for PCOS, PCOD, irregular & painful periods and fertility.",
    image: "/images/infertility.png",
  },
  {
    num: "05",
    title: "Stomach & Digestion",
    desc: "Resolving acidity, gas, constipation, IBS, bloating, piles & fatty liver.",
    image: "/images/g5.jpg",
  },
  {
    num: "06",
    title: "Stress & Lifestyle",
    desc: "Therapies for insomnia, anxiety, migraine, obesity, thyroid & diabetes.",
    image: "/images/g4.jpg",
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
        if (isMounted && data && data.length > 0) {
          setItems(
            data.map((t, idx) => {
              const fallback = DEFAULT_TREATMENTS[idx % DEFAULT_TREATMENTS.length]?.image || "/images/panchkaram.jpeg";
              return {
                num: String(idx + 1).padStart(2, "0"),
                title: t.name,
                desc: t.shortDescription || t.description,
                image: t.image || fallback,
              };
            })
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
                width={360}
                height={200}
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
