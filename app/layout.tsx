import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Use Outfit
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Engram | Knowledge Stays",
  description: "A science-based learning platform for active recall.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased dark`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
