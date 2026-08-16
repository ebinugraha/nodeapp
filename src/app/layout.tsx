import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "jotai";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CleenChat - Deteksi & Hapus Komentar Judi Online Otomatis",
    template: "%s | CleenChat",
  },
  description: "Platform moderasi YouTube Live Chat otomatis berbasis DAG. Deteksi kata kunci judi online, slot, dan spam secara real-time tanpa perlu coding.",
  keywords: ["moderasi youtube", "bot hapus komentar judi", "auto delete chat youtube", "bot youtube live", "sistem DAG moderasi"],
  authors: [{ name: "CleenChat Team" }],
  icons: {
    icon: "/logos/logo.svg",
  },
  openGraph: {
    type: "website",
    title: "CleenChat - Deteksi Judi Online",
    description: "Platform otomatis untuk menghapus komentar spam dan judi di YouTube Live berbasis AI.",
    images: ["/og-image.png"],
    url: "https://cleenchat.my.id",
    siteName: "CleenChat",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieString = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCReactProvider cookieString={cookieString}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NuqsAdapter>
              <Toaster />
              <Provider>{children}</Provider>
            </NuqsAdapter>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
