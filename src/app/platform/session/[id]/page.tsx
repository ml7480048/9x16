export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
        Session {id}
      </h1>
      <p className="max-w-xs text-sm text-text-secondary">
        VerticalPlayer + VariantSwitcher land here in Week 3.
      </p>
    </div>
  );
}
