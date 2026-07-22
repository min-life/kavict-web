import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KAVICT - Nền tảng Giáo dục Tài chính",
  description:
    "Trải nghiệm học tập tài chính tối ưu cùng KAVICT - Gia sư AI, Mô phỏng đầu tư, và Lộ trình học cá nhân hoá.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${hankenGrotesk.variable} ${inter.variable} ${geistSans.variable} h-full w-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Material Symbols Outlined - Icon font used by Stitch designs */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full w-full flex flex-col font-body-md text-body-md text-on-surface bg-background" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
