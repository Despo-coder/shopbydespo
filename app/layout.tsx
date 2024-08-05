import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Variable } from "lucide-react";
import { cn } from "@/lib/utils";
import {Toaster} from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] , variable: "--font-sans"}, );

export const metadata: Metadata = {
  title: "Shops By Despo",
  description: "Shopping App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn('bg-background min-h-screen font-sans antialiased', inter.variable)}>
        {children}
        <Toaster />
        </body>
    </html>
  );
}
