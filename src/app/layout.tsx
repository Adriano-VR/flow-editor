import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ChatProvider } from '@/contexts/ChatContext';

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased font-mono`}>
        <ChatProvider>
          <Providers>
            {children}
          </Providers>
        </ChatProvider>
      </body>
    </html>
  );
}