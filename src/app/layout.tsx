import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic, Cairo } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import {getPublicSeo} from "@/server/services/seo.service";

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

export async function generateMetadata():Promise<Metadata>{
 const seo=await getPublicSeo();
 return {
  metadataBase:new URL(seo.origin),
  title:{default:seo.title,template:"%s | Creative Marketing"},
  description:seo.description,
  applicationName:"Creative Marketing",
  authors:[{name:"Creative Marketing"}],
  openGraph:{title:seo.title,description:seo.description,locale:"ar_EG",type:"website",siteName:"Creative Marketing",images:seo.image?[seo.image]:undefined},
  twitter:{card:seo.image?"summary_large_image":"summary",title:seo.title,description:seo.description,images:seo.image?[seo.image]:undefined},
 };
}

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
