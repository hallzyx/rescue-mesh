import { STATUS_LABELS, type IncidentStatus } from "@/domain/incident";
import { cn } from "@/lib/utils";

const styles: Record<IncidentStatus, string> = {
  new: "border-sky-500 text-sky-300 bg-sky-950/40",
  acknowledged: "border-violet-500 text-violet-300 bg-violet-950/40",
  in_progress: "border-amber-500 text-amber-300 bg-amber-950/40",
  resolved: "border-emerald-600 text-emerald-300 bg-emerald-950/40",
};

export function StatusBadge({
  status,
  className,
}: {
  status: IncidentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold tracking-wide",
        styles[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
