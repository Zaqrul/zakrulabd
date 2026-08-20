"use client";

/* The pieces every field on the enquiry form shares: the clear button, the
   valid/invalid mark, the counter, and the ring the long field uses. Kept here
   so the form itself reads as a list of fields rather than as markup. */

export function Cross({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

/* Empty a field in one press. Selecting the text first is fiddly on a phone,
   and a field someone cannot easily correct is a field they abandon. */
export function ClearButton({ onClick, title, className = "" }: { onClick: () => void; title: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      title={title}
      className={`flex h-6 w-6 items-center justify-center rounded-full text-muted transition hover:bg-bg hover:text-navy ${className}`}
    >
      <Cross />
    </button>
  );
}

/* Shown only once a field has been left or submitted: marking an address wrong
   while it is still being typed is noise, because every address is invalid
   until the last character. */
export function StatusMark({ status }: { status: "valid" | "invalid" | "none" }) {
  if (status === "none") return null;

  const valid = status === "valid";
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
        valid ? "bg-teal-600 text-white" : "bg-amber-500 text-navy"
      }`}
    >
      {valid ? (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5">
          <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <Cross className="h-3 w-3" />
      )}
    </span>
  );
}

/* A ring rather than a "1840/2000" line: at a glance it is the shape that
   carries the meaning, and the number is there for anyone who wants it. It
   turns amber past three quarters and stays amber at the cap, so running out
   of room is visible before it happens. */
export function CountRing({ used, max }: { used: number; max: number }) {
  const ratio = Math.min(used / max, 1);
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const tight = ratio >= 0.75;

  return (
    <span className="flex items-center gap-2 text-[12px] text-muted">
      <svg viewBox="0 0 24 24" className="h-5 w-5 -rotate-90" aria-hidden>
        <circle cx="12" cy="12" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="3" />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke={tight ? "var(--color-amber-500)" : "var(--color-teal-600)"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-all duration-200"
        />
      </svg>
      <span className={tight ? "font-semibold text-navy" : ""}>
        {used}/{max}
      </span>
    </span>
  );
}

/* One line under a field: the instruction while it is untouched, the fix once
   it is wrong. role="alert" only in the error case, so a screen reader is not
   interrupted by a hint it has already heard. */
export function FieldNote({ error, hint, id }: { error?: string; hint?: string; id: string }) {
  if (error) {
    return (
      <span id={id} role="alert" className="text-[12.5px] font-medium text-navy">
        {error}
      </span>
    );
  }
  if (!hint) return null;
  return (
    <span id={id} className="text-[12.5px] text-muted">
      {hint}
    </span>
  );
}
