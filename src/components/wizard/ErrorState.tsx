import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="max-w-xs text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <Button type="button" variant="accent" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
