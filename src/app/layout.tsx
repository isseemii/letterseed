import type { Metadata } from "next";
import "../css/globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "글짜씨",
  description: "한국타이포그라피학회 학술지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}