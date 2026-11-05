import type { Metadata } from "next";
import ThemeProvider from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BADDEL | بدّل — سوق الجزائر",
  description: "منصتك الجزائرية للبيع والشراء والتبادل.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "BADDEL" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl" suppressHydrationWarning><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}
