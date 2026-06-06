import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import PWA from "@/components/PWA";
import ErrorBoundary from "@/components/ErrorBoundary";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: "EduPlan Manager - Gestão de Planos de Aula",
  description: "Sistema Inteligente de Gestão de Planos de Aula",
  manifest: "/manifest.json",
  icons: { apple: "/icon-192.svg" },
  appleWebApp: { capable: true, title: "EduPlan", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "EduPlan Manager",
    description: "Sistema Inteligente de Gestão de Planos de Aula",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <body>
        <AuthProvider>
          <ErrorBoundary>
          <PWA />
          {children}
          </ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#1e293b",
                color: "#f8fafc",
                fontSize: "14px",
              },
            }}
            containerStyle={{ role: "alert", "aria-live": "assertive" } as any}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
