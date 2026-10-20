import type { CSSProperties, ReactNode } from "react";
import type { IconType } from "react-icons";
import { TbX } from "react-icons/tb";

export const SPACE_PRIMARY = "rounded-md border border-amber-200/40 bg-amber-400 px-4 py-1.5 font-mono text-[11px] font-extrabold uppercase tracking-wide text-[#111827] transition-colors hover:bg-amber-300 active:bg-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:py-2";
export const SPACE_SECONDARY = "rounded-md border border-slate-500/70 bg-[#111b2c] px-4 py-1.5 font-mono text-[11px] font-bold text-slate-100 transition-colors hover:border-slate-300 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:py-2";

/* Both hosts use this shell. The flight surface remains owned by Space so a
   phone rotation carries the same canvas and its live run into document.body. */
export function SpaceFrame({ title, icon: Icon, closeLabel, onClose, arcade = false, children }: {
  title: string;
  icon: IconType;
  closeLabel: string;
  onClose: () => void;
  arcade?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      data-space-frame
      data-space-layout={arcade ? "arcade" : "dock"}
      className="mx-auto flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-600 bg-[#080f1e] text-slate-100 shadow-2xl shadow-black/40"
      style={arcade ? { maxWidth: "min(100%, calc((100dvh - 320px) * 16 / 9 + 20px))", "--space-stage-max": "max(200px, calc((100dvh - 320px) * 16 / 9))" } as CSSProperties : undefined}
    >
      <header className="flex h-11 shrink-0 items-center gap-2.5 border-b border-slate-600/70 bg-[#111b2c] px-3">
        <Icon aria-hidden="true" className="h-5 w-5 text-amber-400" />
        <h2 className="min-w-0 flex-1 truncate font-display text-sm font-extrabold uppercase tracking-[.16em]">{title}</h2>
        <span aria-hidden="true" className="mr-1 h-1 w-8 bg-amber-400/80" />
        <button type="button" aria-label={closeLabel} onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded border border-transparent text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          <TbX aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-2 sm:p-2.5">{children}</div>
    </section>
  );
}
