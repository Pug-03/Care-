import type { Metadata, Viewport } from "next";
import { Anuphan, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Arial (the generated fallback) has no Thai glyphs; use real Thai system faces instead.
const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  variable: "--font-anuphan",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Leelawadee UI", "Thonburi", "Noto Sans Thai", "system-ui", "sans-serif"],
});
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  title: "CARE+ · ดูแลสุขภาพไปกับน้องแมว",
  description: "CARE+ ประเมินความเสี่ยงสุขภาพเบื้องต้น เปรียบเทียบทางเลือกด้วยข้อมูลที่มีแหล่งอ้างอิง ทำภารกิจสุขภาพรับ XP แล้วนำไปดูแลแมวเสมือนจริง",
};

export const viewport: Viewport = {
  themeColor: "#eaf3ff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${anuphan.variable} ${instrument.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        {/* Lets CSS hide scroll-reveal content only when JS is there to reveal it. In <body>, not <head>,
            because ad-blocking extensions inject scripts into <head> and break hydration there. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* CARE+ has no service worker. Remove any left on this origin by another app (see public/sw.js),
            so it can never serve an old stylesheet; reload once if one was controlling this page. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){if(!r.length)return;var c=!!navigator.serviceWorker.controller;Promise.all(r.map(function(x){return x.unregister()})).then(function(){return window.caches?caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}):0}).then(function(){if(c&&!sessionStorage.getItem('careplus-sw-reset')){sessionStorage.setItem('careplus-sw-reset','1');location.reload()}})}).catch(function(){})}",
          }}
        />
        <a href="#main" className="skip-link">
          ข้ามไปยังเนื้อหา
        </a>
        {children}
      </body>
    </html>
  );
}
