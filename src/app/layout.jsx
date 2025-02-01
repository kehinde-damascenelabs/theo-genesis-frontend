import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: 'Genesis Labs Voice AI Demo',
  description: 'AI Voice Agent Demo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Paste the Google AdSense script here */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
