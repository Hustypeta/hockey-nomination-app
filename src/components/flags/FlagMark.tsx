import type { ReactNode } from "react";

function norm(code: string | undefined | null) {
  if (code == null) return "";
  const s = String(code).trim();
  return s ? s.toUpperCase() : "";
}

function Svg({ children, className = "", title }: { children: ReactNode; className?: string; title: string }) {
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

export function FlagMark({ code, className = "" }: { code: string | undefined | null; className?: string }) {
  const raw = norm(code);
  if (!raw) {
    return (
      <span
        className={`inline-flex h-5 w-7 items-center justify-center rounded-[3px] bg-white/10 text-sm ring-1 ring-white/15 ${className}`}
        aria-hidden
        title="Vlajka — bez kódu"
      >
        🏒
      </span>
    );
  }
  if (raw === "CZE") {
    return (
      <Svg className={className} title="Česko">
        <rect width="30" height="20" fill="#ffffff" />
        <rect y="10" width="30" height="10" fill="#d7141a" />
        <polygon points="0,0 15,10 0,20" fill="#11457e" />
      </Svg>
    );
  }
  if (raw === "SWE") {
    return (
      <Svg className={className} title="Švédsko">
        <rect width="30" height="20" fill="#005293" />
        <rect x="9" width="4" height="20" fill="#FECB00" />
        <rect y="8" width="30" height="4" fill="#FECB00" />
      </Svg>
    );
  }
  if (raw === "FIN") {
    return (
      <Svg className={className} title="Finsko">
        <rect width="30" height="20" fill="#ffffff" />
        <rect x="8" width="5" height="20" fill="#003580" />
        <rect y="8" width="30" height="5" fill="#003580" />
      </Svg>
    );
  }
  if (raw === "SUI") {
    return (
      <Svg className={className} title="Švýcarsko">
        <rect width="30" height="20" fill="#d52b1e" />
        <rect x="12.25" y="4.25" width="5.5" height="11.5" fill="#ffffff" />
        <rect x="9.25" y="7.25" width="11.5" height="5.5" fill="#ffffff" />
      </Svg>
    );
  }
  if (raw === "USA") {
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
  if (raw === "CAN") {
    return (
      <Svg className={className} title="Kanada">
        <rect width="30" height="20" fill="#ffffff" />
        <rect width="7" height="20" fill="#d00" />
        <rect x="23" width="7" height="20" fill="#d00" />
        <rect x="12" y="6" width="6" height="8" fill="#d00" />
      </Svg>
    );
  }
  if (raw === "AUT") {
    return (
      <Svg className={className} title="Rakousko">
        <rect width="30" height="6.67" fill="#ED2939" />
        <rect y="6.67" width="30" height="6.66" fill="#ffffff" />
        <rect y="13.33" width="30" height="6.67" fill="#ED2939" />
      </Svg>
    );
  }
  if (raw === "DEN") {
    return (
      <Svg className={className} title="Dánsko">
        <rect width="30" height="20" fill="#C8102E" />
        <rect x="8" width="4" height="20" fill="#ffffff" />
        <rect y="8" width="30" height="4" fill="#ffffff" />
      </Svg>
    );
  }
  if (raw === "FRA") {
    return (
      <Svg className={className} title="Francie">
        <rect width="10" height="20" fill="#002395" />
        <rect x="10" width="10" height="20" fill="#ffffff" />
        <rect x="20" width="10" height="20" fill="#ED2939" />
      </Svg>
    );
  }
  if (raw === "GER") {
    return (
      <Svg className={className} title="Německo">
        <rect width="30" height="6.67" fill="#000000" />
        <rect y="6.67" width="30" height="6.66" fill="#DD0000" />
        <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
      </Svg>
    );
  }
  if (raw === "GBR") {
    return (
      <Svg className={className} title="Velká Británie">
        <rect width="30" height="20" fill="#012169" />
        <path d="M0,0 L30,20 M30,0 L0,20" stroke="#ffffff" strokeWidth="5" strokeLinecap="square" />
        <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="2.2" strokeLinecap="square" />
        <path d="M15,0 V20 M0,10 H30" stroke="#ffffff" strokeWidth="7" />
        <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="4" />
      </Svg>
    );
  }
  if (raw === "HUN") {
    return (
      <Svg className={className} title="Maďarsko">
        <rect width="30" height="6.67" fill="#CD2A3E" />
        <rect y="6.67" width="30" height="6.66" fill="#ffffff" />
        <rect y="13.33" width="30" height="6.67" fill="#436F4D" />
      </Svg>
    );
  }
  if (raw === "ITA") {
    return (
      <Svg className={className} title="Itálie">
        <rect width="10" height="20" fill="#009246" />
        <rect x="10" width="10" height="20" fill="#ffffff" />
        <rect x="20" width="10" height="20" fill="#CE2B37" />
      </Svg>
    );
  }
  if (raw === "KAZ") {
    return (
      <Svg className={className} title="Kazachstán">
        <rect width="30" height="20" fill="#00AFCA" />
        <circle cx="10" cy="10" r="4.2" fill="#FEC50C" />
      </Svg>
    );
  }
  if (raw === "LAT") {
    return (
      <Svg className={className} title="Lotyšsko">
        <rect width="30" height="8" fill="#9E3039" />
        <rect y="8" width="30" height="4" fill="#ffffff" />
        <rect y="12" width="30" height="8" fill="#9E3039" />
      </Svg>
    );
  }
  if (raw === "NOR") {
    return (
      <Svg className={className} title="Norsko">
        <rect width="30" height="20" fill="#BA0C2F" />
        <rect x="0" y="7" width="30" height="6" fill="#ffffff" />
        <rect x="7" y="0" width="6" height="20" fill="#ffffff" />
        <rect x="0" y="8.25" width="30" height="3.5" fill="#002868" />
        <rect x="8.25" y="0" width="3.5" height="20" fill="#002868" />
      </Svg>
    );
  }
  if (raw === "POL") {
    return (
      <Svg className={className} title="Polsko">
        <rect width="30" height="10" fill="#ffffff" />
        <rect y="10" width="30" height="10" fill="#DC143C" />
      </Svg>
    );
  }
  if (raw === "SLO") {
    return (
      <Svg className={className} title="Slovinsko">
        <rect width="30" height="6.67" fill="#ffffff" />
        <rect y="6.67" width="30" height="6.66" fill="#005EB8" />
        <rect y="13.33" width="30" height="6.67" fill="#DA291C" />
      </Svg>
    );
  }
  if (raw === "SVK") {
    return (
      <Svg className={className} title="Slovensko">
        <rect width="30" height="6.67" fill="#ffffff" />
        <rect y="6.67" width="30" height="6.66" fill="#0B4EA2" />
        <rect y="13.33" width="30" height="6.67" fill="#EE1C25" />
      </Svg>
    );
  }
  // Fallback: neutral "flag" tile with code
  return (
    <span
      className={`inline-flex h-5 w-7 items-center justify-center rounded-[3px] bg-white/10 text-[10px] font-black tracking-wide text-white/80 ring-1 ring-white/15 ${className}`}
      aria-hidden
      title={raw}
    >
      {raw.slice(0, 3)}
    </span>
  );
}

