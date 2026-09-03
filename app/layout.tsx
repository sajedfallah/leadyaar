import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "لیدیار | دستیار هوشمند جذب مشتری",
  description: "لیدیار هر روز مشتریان بالقوه مناسب را پیدا می‌کند و مسیر تماس، پیگیری و تبدیل را مدیریت می‌کند.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
