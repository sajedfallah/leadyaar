import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "لیدیار | دستیار هوشمند جذب مشتری",
  description: "لیدیار مشتری بالقوه پیدا می‌کند و مسیر تماس، پیگیری و تبدیل را مدیریت می‌کند.",
  applicationName: "LeadYar",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js?63" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
