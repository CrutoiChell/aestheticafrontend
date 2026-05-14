import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Эстетика — Платформа художественных выставок",
  description: "Создавайте и исследуйте выставки из галерей по всему миру",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.className} data-scroll-behavior="smooth">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
