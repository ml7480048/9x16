import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

// A24-minimalist pass (2026-07): the New Session / Sessions / Settings
// sub-nav now lives inside Header's subNav slot (small text row under the
// logo) instead of a separate full-width side column — one floating nav
// row, not two bars.
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Header subNav={<Sidebar />} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-6">
        {children}
      </main>
    </div>
  );
}
