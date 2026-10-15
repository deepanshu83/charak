import { Suspense } from "react";
import BrandHeader from "@/components/ui/BrandHeader";
import ProductListing from "@/components/catalog/ProductListing";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayurvedic Products & Formulations | Charak Ayurveda Pilani",
  description:
    "Browse authentic Ayurvedic classical formulations, therapeutic oils, herbal rasayanas, and wellness kits from Charak Ayurveda Pilani.",
  alternates: {
    canonical: "https://charakayurvedapilani.com/products",
  },
  openGraph: {
    title: "Ayurvedic Products & Formulations | Charak Ayurveda Pilani",
    description:
      "Explore classical herbal rasayanas, oils, and wellness formulations formulated under Ayurvedic supervision.",
    url: "https://charakayurvedapilani.com/products",
    images: [{ url: "/images/g3.jpg", alt: "Ayurvedic Products Charak" }],
  },
};

export default function ProductsPage() {
  return (
    <BrandHeader>
      <Suspense fallback={<div style={{ minHeight: "60vh", background: "#fbfaf6" }} />}>
        <ProductListing />
      </Suspense>
    </BrandHeader>
  );
}
