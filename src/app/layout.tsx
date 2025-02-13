import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dark Lang - AI teacher",
  description: "Learn english in the dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.png" type="image/png" />
      </head>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
