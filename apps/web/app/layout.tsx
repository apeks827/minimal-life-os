import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LifeInbox AI",
  description: "Minimal life operating system with AI inbox classification.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="font-body">{children}</body>
    </html>
  );
}
