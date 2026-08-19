"use client";

import { Fragment, useMemo, useState } from "react";
import { CheckIcon, SearchIcon } from "@/components/icons";
import { content as t } from "@/lib/content";
import { wa, waMessages } from "@/lib/contact";

const c = t.pricing.compare;
const tierWaMessages = [waMessages.starter, waMessages.business, waMessages.custom];

/* Three states, three shapes, so a row reads without reaching for the legend:
   a teal tick for included, an amber tick for the basic version, a cross for not.
   Amber always carries dark ink, the same rule the .hl marker follows. */
function Mark({ mark }: { mark: string }) {
  if (mark === "full") {
    return (
      <span
        title={c.legend[0].label}
        className="mx-auto flex h-[22px] w-[22px] items-center justify-center rounded-full bg-teal-600"
      >
        <CheckIcon className="h-3.5 w-3.5 text-white" />
        <span className="sr-only">{c.legend[0].label}</span>
      </span>
    );
  }
  if (mark === "part") {
    return (
      <span
        title={c.legend[1].label}
        className="mx-auto flex h-[22px] w-[22px] items-center justify-center rounded-full bg-amber-400"
      >
        <CheckIcon className="h-3.5 w-3.5 text-navy" />
        <span className="sr-only">{c.legend[1].label}</span>
      </span>
    );
  }
  return (
    <span title={c.legend[2].label} className="mx-auto flex h-[22px] w-[22px] items-center justify-center">
      <span aria-hidden className="text-[15px] leading-none text-muted/60">
        ✕
      </span>
      <span className="sr-only">{c.legend[2].label}</span>
    </span>
  );
}

function TierCta({ index, className = "" }: { index: number; className?: string }) {
  return (
    <a
      href={wa(tierWaMessages[index])}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-primary inline-flex items-center justify-center rounded-lg px-3.5 py-1.5 text-[11.5px] font-bold transition-colors ${
        index === 1
          ? "bg-amber-500 text-navy hover:bg-amber-600"
          : "border-[1.5px] border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white"
      } ${className}`}
    >
      {c.ctaLabel}
    </a>
  );
}

export function ScopeCompareTable() {
  const [query, setQuery] = useState("");

  // A group disappears once the search empties it, so the reader never scrolls
  // past a heading with nothing under it.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return c.groups;
    return c.groups
      .map((g) => ({
        ...g,
        rows: g.rows.filter((r) => `${r.what} ${r.note}`.toLowerCase().includes(q)),
      }))
      .filter((g) => g.rows.length > 0);
  }, [query]);

  return (
    <div className="rounded-[18px] border border-border bg-white">
      <div className="px-5 py-4 md:px-6">
        <label className="flex items-center gap-2.5 rounded-lg border border-border bg-bg px-3 py-2 focus-within:border-navy">
          <SearchIcon className="h-4 w-4 flex-shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            aria-label={c.searchPlaceholder}
            className="w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-muted"
          />
        </label>
      </div>

      {/* MOBILE: the row label takes a line of its own and the three marks sit
          under it, aligned to the tier row pinned below the site header. */}
      <div className="md:hidden">
        <div className="sticky top-[69px] z-30 grid grid-cols-3 border-y border-border bg-white">
          {c.columns.map((col, i) => (
            <div key={col} className="flex flex-col items-center gap-1.5 px-1 py-3">
              <span className="text-center font-display text-[13px] font-bold text-navy">{col}</span>
              <TierCta index={i} />
            </div>
          ))}
        </div>

        {groups.map((group) => (
          <div key={group.label}>
            <div className="border-b border-border px-5 pb-3 pt-7">
              <h2 className="font-display text-[16px] font-bold text-navy">{group.label}</h2>
            </div>
            {group.rows.map((row) => (
              <div key={row.what} className="border-b border-border px-5 py-4">
                <span className="block text-[14px] font-medium text-ink">{row.what}</span>
                <span className="block text-[12.5px] leading-snug text-muted">{row.note}</span>
                <div className="mt-3 grid grid-cols-3">
                  {row.marks.map((mark, i) => (
                    <div key={c.columns[i]} className="flex justify-center">
                      <Mark mark={mark} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {groups.length === 0 && <p className="px-5 py-12 text-center text-[13.5px] text-muted">{c.searchEmpty}</p>}
      </div>

      {/* DESKTOP: one grid, with the tier row pinned so a mark far down the table
          never has to be counted back to its column. */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="sticky top-[69px] z-30 bg-white px-6 py-3 shadow-[inset_0_-1px_0_var(--color-border)]" />
              {c.columns.map((col, i) => (
                <th
                  key={col}
                  className="sticky top-[69px] z-30 w-[132px] bg-white px-3 py-3 text-center align-middle shadow-[inset_0_-1px_0_var(--color-border)]"
                >
                  <span className="block font-display text-[14px] font-bold text-navy">{col}</span>
                  <TierCta index={i} className="mt-2" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groups.map((group) => (
              <Fragment key={group.label}>
                <tr>
                  <td colSpan={4} className="px-6 pb-3 pt-9">
                    <h2 className="font-display text-[17px] font-bold text-navy">{group.label}</h2>
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.what} className="border-t border-border hover:bg-bg">
                    <td className="px-6 py-4 align-middle">
                      <span className="block text-[14px] font-medium text-ink">{row.what}</span>
                      <span className="block text-[12.5px] leading-snug text-muted">{row.note}</span>
                    </td>
                    {row.marks.map((mark, i) => (
                      <td key={c.columns[i]} className="px-3 py-4 align-middle">
                        <Mark mark={mark} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}

            {groups.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[13.5px] text-muted">
                  {c.searchEmpty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border px-5 py-4 text-[12.5px] text-muted md:px-6">
        {c.legend.map((l) => (
          <span key={l.mark} className="flex items-center gap-2">
            <Mark mark={l.mark} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
