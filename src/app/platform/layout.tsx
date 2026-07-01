import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="flex flex-1 flex-col sm:flex-row">
        <Sidebar />
        <main className="flex flex-1 flex-col p-6">{children}</main>
      </div>
    </div>
  );
}
