"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Treatments from "@/components/Treatments";
import DoshaExplorer from "@/components/DoshaExplorer";
import HealingJourney from "@/components/HealingJourney";
import Approach from "@/components/Approach";
import Reviews from "@/components/Reviews";
import Gallery from "@/components/Gallery";
import HomeBlogPreview from "@/components/HomeBlogPreview";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";

export default function Home() {
  const [selectedConcern, setSelectedConcern] = useState<string>("Panchakarma");

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Treatments onSelectConcern={(concern) => setSelectedConcern(concern)} />
        <DoshaExplorer />
        <HealingJourney />
        <Approach />
        <Reviews />
        <Gallery limit={4} showTabs={false} showViewMore={true} />
        <HomeBlogPreview />
        <ContactForm selectedConcern={selectedConcern} />
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
