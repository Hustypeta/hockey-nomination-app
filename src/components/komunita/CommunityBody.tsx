"use client";

/** Jednoduché zobrazení textu — zachová řádky, **tučné** přes regex. */
export function CommunityBody({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div className={`whitespace-pre-wrap text-sm leading-relaxed text-white/85 ${className}`}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
