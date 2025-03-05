import type { Metadata } from "next";
import { ContactsPage } from "@/features/Landing/Contact/ContactsPage";
import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";

export const metadata: Metadata = {
  title: "Contacts | Dark Lang",
  description: "Get in touch with the Dark Lang for any inquiries, support, or feedback.",
  keywords: [],
  openGraph: { ...openGraph, url: `${siteUrl}contacts` },
  twitter: twitter,
  robots: robots,
};

export default async function ContactsFullPage() {
  return <ContactsPage />;
}
