import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BatchLoop - Modern B2B Wholesale Marketplace",
  description: "Direct Trade Between Wholesalers & Retail Stores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
