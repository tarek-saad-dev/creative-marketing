import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic, Cairo } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

/**
 * Arabic-first type stack:
 * - Noto Kufi Arabic → geometric display headlines (strong brand presence)
 * - Cairo → modern readable body / UI copy
 * Both include Latin glyphs for mixed AR/EN content.
 */
const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Creative Marketing",
    template: "%s | Creative Marketing",
  },
  description:
    "وكالة كرييتف ماركتنج: استراتيجية، محتوى، تصميم وإدارة سوشيال ميديا تساعد مشروعك يظهر باحتراف ويكسب ثقة العميل من أول نظرة.",
  applicationName: "Creative Marketing",
  keywords: [
    "Creative Marketing",
    "تسويق إبداعي",
    "سوشيال ميديا",
    "هوية بصرية",
    "إدارة صفحات",
    "محتوى",
  ],
  authors: [{ name: "Creative Marketing" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Creative Marketing",
    description: "WE THINK. WE CREATE. YOU GROW.",
    locale: "ar_SA",
    type: "website",
    siteName: "Creative Marketing",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Creative Marketing",
    description: "WE THINK. WE CREATE. YOU GROW.",
  },
};

export const viewport: Viewport = {
  themeColor: "#2C1F73",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${notoKufiArabic.variable} ${cairo.variable}`}
    >
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
