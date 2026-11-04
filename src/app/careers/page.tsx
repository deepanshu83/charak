import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import CareersPageClient from "@/components/CareersPage";

export const metadata: Metadata = {
  title: "Careers & Job Vacancies | Charak Ayurveda Pilani",
  description:
    "Join our growing team at Charak Ayurveda, Pilani. Explore current job openings for Ayurvedic doctors, therapists, nurses, and clinic staff.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers at Charak Ayurveda Pilani",
    description:
      "We're hiring! Explore current vacancies at Charak Ayurveda – Panchakarma, Skin Care, Joint Care & Infertility Center in Pilani, Rajasthan.",
    url: "/careers",
    type: "website",
  },
};

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main>
        <CareersPageClient />
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
