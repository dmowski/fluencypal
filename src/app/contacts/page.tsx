import type { Metadata } from "next";
import { ContactsPage } from "@/features/Landing/Contact/ContactsPage";
import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";
import { APP_NAME } from "@/features/Landing/landingSettings";

export const metadata: Metadata = {
  title: `Contacts | ${APP_NAME}`,
  description: `Get in touch with the ${APP_NAME} for any inquiries, support, or feedback.`,
  keywords: [],
  openGraph: { ...openGraph, url: `${siteUrl}contacts` },
  twitter: twitter,
  robots: robots,
};

export default async function ContactsFullPage() {
  return <ContactsPage />;
}
