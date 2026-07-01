export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col justify-center gap-2 px-6 py-24">
      <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] text-text-primary">
        Session {id}
      </h1>
      <p className="max-w-xs text-sm text-text-secondary">
        VerticalPlayer + VariantSwitcher land here in Week 3.
      </p>
    </div>
  );
}
