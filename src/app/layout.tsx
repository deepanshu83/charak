import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { CartProvider } from "@/lib/cart-store";
import { ToastProvider } from "@/components/ui/ToastContext";
import { getProducts } from "@/lib/productService";
import "./globals.css";
import "./mvp.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Charak Ayurveda | Panchakarma, Skin Care, Joint Care & Infertility Center",
  description:
    "Charak Ayurveda at Vidyavihar, Pilani. Classical Panchakarma, skin disorders, chronic joint care and holistic infertility treatment rooted in ancient Vedic science.",
  keywords: [
    "Charak Ayurveda",
    "Panchakarma Pilani",
    "Ayurvedic Doctor Pilani",
    "Skin Care Ayurveda Vidyavihar",
    "Joint Care Ayurveda",
    "Infertility Treatment Pilani",
    "Ayurvedic Clinic Rajasthan",
  ],
  metadataBase: new URL("https://charakayurvedapilani.com"),
  authors: [{ name: "Charak Ayurveda" }],
  openGraph: {
    title: "Charak Ayurveda | Ancient Healing, Personally Yours",
    description:
      "Classical Ayurvedic care and authentic Panchakarma therapies beside Birla Hospital, Vidyavihar, Pilani.",
    url: "https://charakayurvedapilani.com",
    siteName: "Charak Ayurveda",
    images: [
      {
        url: "/images/ourApproach.jpeg",
        width: 1200,
        height: 630,
        alt: "Charak Ayurveda Pilani",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Charak Ayurveda | Classical Panchakarma & Consultation",
    description:
      "Classical Ayurvedic care and authentic Panchakarma therapies beside Birla Hospital, Vidyavihar, Pilani.",
    images: ["/images/ourApproach.jpeg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/logo.png", sizes: "180x180", type: "image/png" },
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: "https://charakayurvedapilani.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Charak Ayurveda",
  url: "https://charakayurvedapilani.com",
  logo: "https://charakayurvedapilani.com/logo.png",
  image: "https://charakayurvedapilani.com/images/ourApproach.jpeg",
  description:
    "Classical Panchakarma, skin disorders, chronic joint care and holistic Ayurvedic consultation in Pilani, Rajasthan.",
  telephone: "+91 88528 87717",
  address: {
    "@type": "PostalAddress",
    streetAddress: "6A, Beside Birla Hospital, Shyam Vatika, Vidyavihar",
    addressLocality: "Pilani",
    addressRegion: "Rajasthan",
    postalCode: "333031",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "28.3639",
    longitude: "75.5873",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:30",
    },
  ],
  medicalSpecialty: ["Ayurvedic", "Holistic Medicine"],
  priceRange: "₹₹",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#184232",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ToastProvider>
          <CartProvider initialProducts={getProducts()}>{children}</CartProvider>
        </ToastProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
