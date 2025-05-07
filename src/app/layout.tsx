import type { Metadata } from "next";
import { FlowProvider } from "@/contexts/FlowContext";
import {  Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adriano",
  description: "A visual flow editor for building automation workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${geistMono.variable} antialiased`}
      >
        <FlowProvider>
          {children}
        </FlowProvider>
      </body>
    </html>
  );
}