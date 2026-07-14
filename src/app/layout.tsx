import Script from "next/script";
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

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
          {metaPixelId ? (
            <>
              <Script id="meta-pixel" strategy="afterInteractive">
                {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);
                  t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${metaPixelId}');
                  fbq('track', 'PageView');`}
              </Script>
              <noscript>
                <img
                  height="1"
                  width="1"
                  style={{ display: "none" }}
                  src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
                  alt="Meta Pixel"
                />
              </noscript>
            </>
          ) : null}
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
