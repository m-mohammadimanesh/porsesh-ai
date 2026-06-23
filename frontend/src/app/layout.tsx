import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Porsesh AI",
  description: "A professional AI chatbot portfolio project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" />
      </head>
      <body className="font-sans antialiased tracking-tight selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
