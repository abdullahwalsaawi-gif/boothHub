import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";

const alexandria = Alexandria({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "بوث هب | Booth Hub",
  description: "منصة ذكية لإدارة المعارض وحجز البوثات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={alexandria.className}>
        {children}
      </body>
    </html>
  );
}
