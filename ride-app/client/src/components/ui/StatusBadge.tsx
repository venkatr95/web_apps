import clsx from "clsx";

const COLORS: Record<string, string> = {
  offline: "bg-zinc-700/60 text-zinc-300 ring-zinc-600/50",
  available: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  reserved: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  accepted: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  en_route: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  on_trip: "bg-violet-500/15 text-violet-400 ring-violet-500/30",
  busy: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  searching: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  offered: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  allocated: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-400 ring-rose-500/30",
  no_drivers: "bg-rose-500/15 text-rose-400 ring-rose-500/30",
};

const PULSE = new Set(["reserved", "searching", "offered", "en_route", "on_trip"]);

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const color = COLORS[status] || "bg-zinc-700/60 text-zinc-300 ring-zinc-600/50";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset uppercase tracking-wide",
        color,
        className
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full bg-current",
          PULSE.has(status) && "animate-pulse"
        )}
      />
      {status.replace(/_/g, " ")}
    </span>
  );
}
