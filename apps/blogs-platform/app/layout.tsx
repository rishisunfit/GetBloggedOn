import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloggish - Your Blog Platform",
  description: "Create and share your blog on Bloggish",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

