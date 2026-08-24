import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export default function Spinner({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-text-muted">
      <Loader2 className={cn("h-6 w-6 animate-spin text-signal", className)} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
