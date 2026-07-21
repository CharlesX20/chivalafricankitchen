import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RestaurantClosedBanner } from "@/components/RestaurantClosedBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: {
    default: "CHIVAL | African Kitchen and Bar - Authentic Nigerian Cuisine in Barrie",
    template: "%s | CHIVAL African Kitchen and Bar",
  },
  description: "Experience authentic Nigerian cuisine at CHIVAL African Kitchen and Bar in Barrie, Ontario. We serve traditional African dishes made with fresh ingredients, bold flavors, and a passion for Nigerian food. Dine in, takeout, and pickup available at 53 Dunlop St E.",
  keywords: [
    "Nigerian restaurant Barrie",
    "African kitchen Barrie",
    "Nigerian food Ontario",
    "authentic African cuisine",
    "CHIVAL kitchen and bar",
    "jollof rice Barrie",
    "Nigerian food near me",
    "African restaurant Barrie",
    "West African food",
    "Nigerian takeout Barrie",
    "suya Barrie",
    "egusi soup Ontario",
  ],
  authors: [{ name: "CHIVAL African Kitchen and Bar" }],
  creator: "CHIVAL African Kitchen and Bar",
  publisher: "CHIVAL African Kitchen and Bar",
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  metadataBase: new URL("https://chivalafricankitchenandbar.ca"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://chivalafricankitchenandbar.ca",
    siteName: "CHIVAL African Kitchen and Bar",
    title: "CHIVAL | African Kitchen and Bar - Authentic Nigerian Cuisine",
    description: "Experience authentic Nigerian cuisine at CHIVAL African Kitchen and Bar in Barrie, Ontario. Traditional African dishes made with fresh ingredients and bold flavors.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CHIVAL African Kitchen and Bar - Authentic Nigerian Cuisine in Barrie, ON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CHIVAL | African Kitchen and Bar - Authentic Nigerian Cuisine",
    description: "Experience authentic Nigerian cuisine at CHIVAL African Kitchen and Bar in Barrie, Ontario. Traditional African dishes with bold flavors.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RestaurantClosedBanner>
            <Navbar />
            {children}
            <Footer />
          </RestaurantClosedBanner>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}