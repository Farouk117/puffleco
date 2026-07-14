import type { Metadata } from "next";
import { Dancing_Script, Libre_Bodoni, Manrope } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const libreBodoni = Libre_Bodoni({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thepufflette.co"),
  title: "The Pufflette.co | Gourmet Pancakes & Puff Puff in Abuja",
  description:
    "Golden puff puff, fluffy gourmet pancakes, premium toppings, and fast fresh delivery across Abuja.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "The Pufflette.co",
    description: "Gourmet pancakes and puff puff made fresh with premium toppings included.",
    url: "https://www.thepufflette.co",
    siteName: "The Pufflette.co",
    images: ["/opengraph-image"],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Pufflette.co",
    description: "Fresh gourmet pancakes and puff puff delivered across Abuja.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="en"
        className={`${manrope.variable} ${libreBodoni.variable} ${dancingScript.variable} h-full scroll-smooth antialiased`}
      >
        <body className="min-h-full">
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
