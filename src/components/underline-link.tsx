import Link from "next/link";

/* The nav's hover underline, pulled out so anything that behaves like a text
   link uses the same one: an amber bar that grows from the left rather than a
   text-decoration line. Kept as a real element instead of a border so the width
   can animate; the bar sits below the descenders, not through them. */
export function UnderlineLink({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      {children}
      <span
        aria-hidden
        className="absolute -bottom-0.5 left-0 h-[2.5px] w-0 rounded-full bg-amber-400 transition-all duration-200 ease-out group-hover:w-full"
      />
    </>
  );

  const classes = `group relative inline-block ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
