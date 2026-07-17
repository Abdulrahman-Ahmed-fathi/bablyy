import { Cormorant_Garamond, Jost } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import type { Metadata } from "next";

const SmoothScrollProvider = dynamic(
  () => import("@/components/providers/SmoothScrollProvider").then((m) => m.SmoothScrollProvider),
  { ssr: false }
);

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <AuthProvider>
          <SmoothScrollProvider>
            {children}
            <ToastProvider />
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}