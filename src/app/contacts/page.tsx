import type { Metadata } from "next";
import { ContactsPage } from "@/features/Landing/Contact/ContactsPage";
const siteUrl = "https://dark-lang.net/";

export const metadata: Metadata = {
  title: "Contacts | Dark Lang",
  description: "Get in touch with the Dark Lang for any inquiries, support, or feedback.",
  keywords: [],
  openGraph: {
    title: "Contacts | Dark Lang",
    description: "Get in touch with the Dark Lang for any inquiries, support, or feedback.",
    url: `${siteUrl}contacts`,
    siteName: "Dark Lang",
    images: [
      {
        url: `${siteUrl}/openGraph.png`,
        width: 1200,
        height: 630,
        alt: "Dark Lang – Affordable AI-Powered Language Learning",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    description: "Get in touch with the Dark Lang for any inquiries, support, or feedback.",
    images: [`${siteUrl}/openGraph.png`],
    creator: "@dmowskii",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function ContactsFullPage() {
  return <ContactsPage />;
}
