import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BADDEL | بدّل — سوق الجزائر",
  description: "منصتك الجزائرية للبيع والشراء والتبادل.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
