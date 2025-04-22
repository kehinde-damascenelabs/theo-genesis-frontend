import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import "../utils/logger"; // Import logger utility to conditionally disable console.log in production

export const metadata = {
  title: 'Genesis Labs Voice AI Demo',
  description: 'AI Voice Agent Demo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9098667159216533"
     crossorigin="anonymous"></script> */}
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
