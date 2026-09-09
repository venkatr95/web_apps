"use client";

import clsx from "clsx";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatEuro } from "@/lib/config";
import { useStore } from "@/lib/store";

const FALLBACK_REASONS = [
  "Changed plans",
  "Wait too long",
  "Found alternative transport",
  "Wrong pickup or destination",
  "Booked by mistake",
  "Driver too far",
  "Booking another ride instead",
  "Other",
];

export function CancelRideModal({
  rideId,
  open,
  onClose,
  onCancelled,
}: {
  rideId: string;
  open: boolean;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const light = useStore((s) => s.uiTheme === "light");
  const pushToast = useStore((s) => s.pushToast);
  const upsertRide = useStore((s) => s.upsertRide);

  const [reasons, setReasons] = useState<string[]>(FALLBACK_REASONS);
  const [reason, setReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [penaltyApplies, setPenaltyApplies] = useState(false);
  const [penaltyEur, setPenaltyEur] = useState(0);
  const [acceptPenalty, setAcceptPenalty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!open || !rideId) return;
    setReason("");
    setOtherText("");
    setAcceptPenalty(false);
    setPreviewLoading(true);
    api
      .cancelPreview(rideId)
      .then((p) => {
        setPenaltyApplies(!!p.penalty_applies);
        setPenaltyEur(p.penalty_eur || 0);
        if (p.reasons?.length) setReasons(p.reasons);
      })
      .catch(() => {
        setPenaltyApplies(false);
        setPenaltyEur(0);
      })
      .finally(() => setPreviewLoading(false));
  }, [open, rideId]);

  if (!open) return null;

  const finalReason =
    reason === "Other" ? otherText.trim() || "Other" : reason.trim();

  async function submit() {
    if (!finalReason || finalReason.length < 2) {
      pushToast("Please choose a cancellation reason", "danger");
      return;
    }
    if (penaltyApplies && !acceptPenalty) {
      pushToast(`Confirm the €${penaltyEur || 5} cancellation fee to continue`, "danger");
      return;
    }
    setLoading(true);
    try {
      const ride = await api.cancelRide(rideId, finalReason, acceptPenalty);
      upsertRide(ride);
      pushToast(
        penaltyApplies
          ? `Ride cancelled · ${formatEuro(penaltyEur || 5)} fee applied`
          : "Ride cancelled",
        "info"
      );
      onCancelled();
      onClose();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Cancel failed", "danger");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative z-10 w-full max-w-md rounded-2xl p-4 shadow-2xl ring-1",
          light
            ? "bg-white text-zinc-900 ring-zinc-200"
            : "bg-zinc-900 text-zinc-100 ring-white/10"
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-bold">Cancel ride {rideId}</div>
            <p className={clsx("mt-0.5 text-xs", light ? "text-zinc-500" : "text-zinc-400")}>
              Tell us why — you can request another ride after cancelling.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              "rounded-lg p-1",
              light ? "text-zinc-400 hover:bg-zinc-100" : "text-zinc-500 hover:bg-white/10"
            )}
          >
            <X size={18} />
          </button>
        </div>

        {previewLoading ? (
          <div className="py-6 text-center text-xs text-zinc-500">Checking…</div>
        ) : (
          <>
            {penaltyApplies && (
              <div className="mb-3 flex gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
                <div>
                  <div className="font-semibold text-amber-200">
                    €{penaltyEur || 5} cancellation fee
                  </div>
                  <p className="mt-0.5 text-amber-100/80">
                    More than 1 minute has passed since the driver accepted. Cancelling
                    now applies a fee.
                  </p>
                  <label className="mt-2 flex cursor-pointer items-center gap-2 font-medium text-amber-50">
                    <input
                      type="checkbox"
                      checked={acceptPenalty}
                      onChange={(e) => setAcceptPenalty(e.target.checked)}
                      className="rounded border-amber-400/50"
                    />
                    I accept the {formatEuro(penaltyEur || 5)} fee
                  </label>
                </div>
              </div>
            )}

            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Reason
            </div>
            <div className="mb-3 max-h-48 space-y-1.5 overflow-y-auto">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={clsx(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                    reason === r
                      ? light
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-emerald-400/50 bg-emerald-400/10"
                      : light
                        ? "border-zinc-200 hover:border-zinc-300"
                        : "border-white/10 hover:border-white/20"
                  )}
                >
                  <input
                    type="radio"
                    name="cancel-reason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-emerald-500"
                  />
                  {r}
                </label>
              ))}
            </div>

            {reason === "Other" && (
              <input
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Briefly describe…"
                className={clsx(
                  "mb-3 w-full rounded-xl border px-3 py-2 text-sm outline-none",
                  light
                    ? "border-zinc-200 bg-white"
                    : "border-white/10 bg-zinc-950 text-zinc-100"
                )}
              />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  "flex-1 rounded-xl border py-2.5 text-sm font-semibold",
                  light ? "border-zinc-200 text-zinc-700" : "border-white/10 text-zinc-300"
                )}
              >
                Keep ride
              </button>
              <button
                type="button"
                disabled={loading || !reason || (penaltyApplies && !acceptPenalty)}
                onClick={() => void submit()}
                className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                {loading ? "Cancelling…" : "Confirm cancel"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
