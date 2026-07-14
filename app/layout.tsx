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
  title: "CHIVAL | African Nigerian Restaurant",
  description: "Authentic Nigerian cuisine in Barrie, Ontario.",
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