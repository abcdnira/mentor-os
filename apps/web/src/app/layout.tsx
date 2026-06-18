import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mentor OS",
  description: "AI Mentor + Second Brain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
