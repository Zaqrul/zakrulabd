import { tech } from "@/lib/tech";
import { findTechMentions } from "@/lib/tech-mentions";

/* The logos for whatever tools a line of copy names, each in its own brand
   colour. Renders nothing when the line names none, so it can be dropped in
   front of any list item without checking first. */
export function TechMarks({ text, className = "", size = 14 }: { text: string; className?: string; size?: number }) {
  const keys = findTechMentions(text);
  if (keys.length === 0) return null;

  return (
    <span className={`flex flex-shrink-0 items-center gap-1.5 ${className}`}>
      {keys.map((key) => {
        const { name, Icon, color } = tech[key];
        return <Icon key={key} aria-hidden="true" title={name} style={{ color, width: size, height: size }} />;
      })}
    </span>
  );
}
