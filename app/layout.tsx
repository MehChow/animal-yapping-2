import type { Metadata } from "next";
import { Tektur } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/nav-bar/Header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";

const tektur = Tektur({
  variable: "--font-tektur",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Animal Yapping 2",
  description: "Animal Yapping 2 - Connect and explore",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return (
    <html lang="en" className={`${tektur.className} no-scrollbar`}>
      <body className="antialiased bg-black">
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
