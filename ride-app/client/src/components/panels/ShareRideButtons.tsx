"use client";

import { Check, Copy, Mail, MessageCircle, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { shareTextForRide, trackingUrl } from "@/lib/config";

export function ShareRideButtons({
  rideId,
  trackingToken,
  status,
  compact = false,
}: {
  rideId: string;
  trackingToken?: string | null;
  status?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const url = useMemo(
    () => (trackingToken ? trackingUrl(trackingToken) : ""),
    [trackingToken]
  );
  const text = useMemo(
    () => (url ? shareTextForRide(rideId, url, status) : ""),
    [rideId, url, status]
  );

  if (!trackingToken || !url) {
    return (
      <div className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-2 text-[11px] text-zinc-500">
        Tracking link unavailable for this ride
      </div>
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      window.prompt("Copy tracking link:", url);
    }
  }

  const mailHref = `mailto:?subject=${encodeURIComponent(
    `Track my ride ${rideId}`
  )}&body=${encodeURIComponent(text)}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/[0.08]"
          title="Copy tracking link"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/15"
        >
          <MessageCircle size={12} /> WhatsApp
        </a>
        <a
          href={mailHref}
          className="inline-flex items-center gap-1 rounded-lg border border-sky-500/25 bg-sky-500/10 px-2 py-1 text-[11px] font-medium text-sky-300 hover:bg-sky-500/15"
        >
          <Mail size={12} /> Email
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        <Share2 size={12} /> Share live tracking
      </div>
      <p className="mb-2 break-all rounded-lg bg-black/30 px-2 py-1.5 font-mono text-[10px] text-zinc-400">
        {url}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08]"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
        >
          <MessageCircle size={14} /> WhatsApp
        </a>
        <a
          href={mailHref}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/25"
        >
          <Mail size={14} /> Email
        </a>
      </div>
    </div>
  );
}
