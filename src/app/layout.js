import "../css/globals.css";
import MultilingualProvider from "../components/MultilingualProvider";
import Script from "next/script";

export const metadata = {
  title: "글짜씨",
  description: "글짜씨 웹버전",
  name: "viewport",
  content: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Noto Sans CJK 폰트 추가 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Script src="/js/jquery.min.js" strategy="beforeInteractive" />
        <Script
          src="/js/jquery.multilingual.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://use.typekit.net/cfw8adz.js"
          strategy="beforeInteractive"
        />
        <Script id="typekit-load" strategy="beforeInteractive">
          {`try{Typekit.load({async:true});}catch(e){}`}
        </Script>

        <MultilingualProvider>
          <div className="multilingualcontainer">{children}</div>
        </MultilingualProvider>
      </body>
    </html>
  );
}