import { AppNav } from "@/components/AppNav";
import { RevealOnScroll } from "@/components/motion/Reveal";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg lg:flex-row">
      <SmoothScroll />
      <RevealOnScroll />
      <AppNav />
      <main id="main" className="min-w-0 flex-1 px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
