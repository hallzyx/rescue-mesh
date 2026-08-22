import { PRIORITY_LABELS, type Priority } from "@/domain/incident";
import { cn } from "@/lib/utils";

const styles: Record<Priority, string> = {
  critical: "bg-red-600 text-white border-red-500",
  high: "bg-orange-600 text-white border-orange-500",
  medium: "bg-amber-500 text-black border-amber-400",
  low: "bg-slate-600 text-white border-slate-500",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-bold tracking-wide",
        styles[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
