import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-full bg-negative/10 p-3">
        <AlertTriangle className="h-5 w-5 text-negative" />
      </div>
      <p className="text-sm text-text-secondary max-w-xs">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
