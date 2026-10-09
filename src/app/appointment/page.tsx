import BrandHeader from "@/components/ui/BrandHeader";
import AppointmentFlow from "@/components/AppointmentFlow";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Consultation & Nadi Pariksha | Charak Ayurveda Pilani",
  description:
    "Schedule your personalized Ayurvedic consultation and Nadi Pariksha with senior Vaidyas at Charak Ayurveda, Vidyavihar, Pilani. Authentic pulse assessment and holistic therapy roadmaps.",
  alternates: {
    canonical: "https://charakayurvedapilani.com/appointment",
  },
  openGraph: {
    title: "Book Consultation & Nadi Pariksha | Charak Ayurveda Pilani",
    description:
      "Reserve your consultation slot with senior Ayurvedic physicians at Charak Ayurveda Pilani.",
    url: "https://charakayurvedapilani.com/appointment",
    images: [{ url: "/images/g5.jpg", alt: "Ayurvedic Consultation Charak" }],
  },
};

export default function AppointmentPage() {
  return <BrandHeader><AppointmentFlow /></BrandHeader>;
}
