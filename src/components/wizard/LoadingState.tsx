export function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p className="text-sm text-text-secondary">{text}</p>
    </div>
  );
}
