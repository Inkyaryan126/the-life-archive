import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://thelifearchive.vip";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "The Life Archive",
  description: "Every life is a story worth keeping.",
  icons: {
    icon: "/images/site-design/book-logo.png",
    apple: "/images/site-design/book-logo.png"
  },
  openGraph: {
    title: "The Life Archive",
    description: "Every life is a story worth keeping.",
    images: [
      {
        url: "/images/site-design/book-logo.png",
        width: 1254,
        height: 1254,
        alt: "The Life Archive book logo"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "The Life Archive",
    description: "Every life is a story worth keeping.",
    images: ["/images/site-design/book-logo.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
