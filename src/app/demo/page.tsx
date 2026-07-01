import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-2 px-6 py-24 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
          Experience the Brand Prototype
        </h1>
        <p className="max-w-xs text-sm text-text-secondary">
          The interactive vertical player and A/B/C variant switcher land
          here in Week 3.
        </p>
      </main>
      <Footer />
    </div>
  );
}
