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
        <a href="#main" className="skip-link">
          ข้ามไปยังเนื้อหา
        </a>
        {children}
      </body>
    </html>
  );
}
