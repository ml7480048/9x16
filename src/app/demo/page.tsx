import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { buttonVariants } from "@/components/ui/Button";
import Link from "next/link";

// The VerticalPlayer + VariantSwitcher smoke test that lived here (Day 11-12)
// is now the real Step 5 of the wizard (src/components/wizard/PrototypeViewer.tsx).
// A public no-auth version of this page (with its own canned demo session)
// is future work — for now this just points to the real flow.
export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
          Experience the Brand Prototype
        </h1>
        <p className="max-w-xs text-sm text-text-secondary">
          The Brand Prototype viewer (vertical player + A/B/C variant switcher)
          is live inside the Platform wizard now. A standalone public demo
          session lands here later.
        </p>
        <Link href="/platform/new" className={buttonVariants()}>
          Try it in the Platform
        </Link>
      </main>
      <Footer />
    </div>
  );
}
