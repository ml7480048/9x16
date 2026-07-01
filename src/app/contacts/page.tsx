import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ContactsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Contacts
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-text-primary">
          Let&apos;s talk.
        </h1>
        <p className="max-w-sm text-sm leading-6 text-text-secondary">
          Whether it&apos;s a brand prototype, a produced series, or just a
          question — reach out.
        </p>
        <dl className="flex flex-col gap-4 border-t border-border pt-6 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-widest text-text-secondary">
              Email
            </dt>
            <dd>
              <a
                href="mailto:hello@9x16.at"
                className="text-text-primary underline decoration-dotted transition-colors hover:text-accent"
              >
                hello@9x16.at
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-widest text-text-secondary">
              Location
            </dt>
            <dd className="text-text-primary">Vienna, Austria</dd>
          </div>
        </dl>
      </main>
      <Footer />
    </div>
  );
}
