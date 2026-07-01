import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

export default function PlatformDashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="font-[family-name:var(--font-display)] max-w-xs text-xl font-bold text-text-primary">
        Start your first Brand Prototype
      </h1>
      <p className="max-w-xs text-sm leading-6 text-text-secondary">
        Create an AI-generated episode prototype and compare brand
        integration variants before production.
      </p>
      <Link href="/platform/new" className={buttonVariants()}>
        New Session
      </Link>
    </div>
  );
}
