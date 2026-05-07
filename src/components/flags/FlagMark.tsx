type FlagCode =
  | "CZE"
  | "SWE"
  | "FIN"
  | "USA"
  | "CAN"
  | "SVK"
  | "GER"
  | "SUI"
  | "AUT"
  | "LAT"
  | "NOR"
  | "DEN"
  | "FRA"
  | "KAZ"
  | "HUN"
  | "POL"
  | "ITA";

function norm(code: string) {
  return code.trim().toUpperCase();
}

function Svg({ children, className = "", title }: { children: React.ReactNode; className?: string; title: string }) {
  return (
    <svg
      className={`h-5 w-7 rounded-[3px] ring-1 ring-black/25 ${className}`}
      viewBox="0 0 30 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}

export function FlagMark({ code, className = "" }: { code: string; className?: string }) {
  const c = norm(code) as FlagCode;
  if (c === "CZE") {
    return (
      <Svg className={className} title="Česko">
        <rect width="30" height="20" fill="#ffffff" />
        <rect y="10" width="30" height="10" fill="#d7141a" />
        <polygon points="0,0 15,10 0,20" fill="#11457e" />
      </Svg>
    );
  }
  if (c === "SWE") {
    return (
      <Svg className={className} title="Švédsko">
        <rect width="30" height="20" fill="#005293" />
        <rect x="9" width="4" height="20" fill="#FECB00" />
        <rect y="8" width="30" height="4" fill="#FECB00" />
      </Svg>
    );
  }
  if (c === "FIN") {
    return (
      <Svg className={className} title="Finsko">
        <rect width="30" height="20" fill="#ffffff" />
        <rect x="8" width="5" height="20" fill="#003580" />
        <rect y="8" width="30" height="5" fill="#003580" />
      </Svg>
    );
  }
  if (c === "SUI") {
    return (
      <Svg className={className} title="Švýcarsko">
        <rect width="30" height="20" fill="#d52b1e" />
        <rect x="12.25" y="4.25" width="5.5" height="11.5" fill="#ffffff" />
        <rect x="9.25" y="7.25" width="11.5" height="5.5" fill="#ffffff" />
      </Svg>
    );
  }
  if (c === "USA") {
    return (
      <Svg className={className} title="USA">
        <rect width="30" height="20" fill="#ffffff" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} y={i * 3} width="30" height="1.6" fill="#b22234" />
        ))}
        <rect width="13" height="10" fill="#3c3b6e" />
      </Svg>
    );
  }
  if (c === "CAN") {
    return (
      <Svg className={className} title="Kanada">
        <rect width="30" height="20" fill="#ffffff" />
        <rect width="7" height="20" fill="#d00" />
        <rect x="23" width="7" height="20" fill="#d00" />
        <rect x="12" y="6" width="6" height="8" fill="#d00" />
      </Svg>
    );
  }
  // Fallback: neutral "flag" tile with code
  return (
    <span
      className={`inline-flex h-5 w-7 items-center justify-center rounded-[3px] bg-white/10 text-[10px] font-black tracking-wide text-white/80 ring-1 ring-white/15 ${className}`}
      aria-hidden
      title={c}
    >
      {c.slice(0, 3)}
    </span>
  );
}

