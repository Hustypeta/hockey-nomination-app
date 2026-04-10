/**
 * Stylizované siluety ve stylu NHL karet: černá hmota + jemné bílé obrysy (náznak obličeje / výstroje).
 * Čisté SVG — škálovatelné, barvy pozadí řeší rodič.
 */

export function SkaterPortraitSilhouette({
  className = "",
  muted = false,
}: {
  className?: string;
  muted?: boolean;
}) {
  const fill = muted ? "rgba(12,14,20,0.35)" : "#07080c";
  const stroke = muted ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.28)";
  const face = muted ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.22)";

  return (
    <svg
      viewBox="0 0 100 128"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Ramena a hruď */}
      <path
        d="M 8 126 L 12 82 Q 14 58 28 52 L 32 48 Q 42 44 50 46 Q 58 44 68 48 L 72 52 Q 86 58 88 82 L 92 126 Z"
        fill={fill}
      />
      {/* Hlava */}
      <ellipse cx="50" cy="34" rx="23" ry="27" fill={fill} />
      {/* Kontur vlasů / helmy */}
      <path
        d="M 26 32 Q 28 12 40 8 Q 50 5 60 8 Q 72 12 74 32"
        fill="none"
        stroke={stroke}
        strokeWidth={1.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 27 28 Q 32 14 50 11 Q 68 14 73 28"
        fill="none"
        stroke={face}
        strokeWidth={0.75}
        strokeLinecap="round"
        opacity={0.85}
      />
      {/* Náznak očí */}
      <path
        d="M 38 33 Q 41 35 44 33"
        fill="none"
        stroke={face}
        strokeWidth={0.9}
        strokeLinecap="round"
      />
      <path
        d="M 56 33 Q 59 35 62 33"
        fill="none"
        stroke={face}
        strokeWidth={0.9}
        strokeLinecap="round"
      />
      {/* Nos */}
      <path
        d="M 50 40 L 50 47"
        fill="none"
        stroke={face}
        strokeWidth={0.75}
        strokeLinecap="round"
      />
      {/* Ústa — jen náznak */}
      <path
        d="M 43 52 Q 50 56 57 52"
        fill="none"
        stroke={face}
        strokeWidth={0.65}
        strokeLinecap="round"
        opacity={0.75}
      />
      {/* Lehký odraz ramen */}
      <path
        d="M 18 78 Q 28 70 38 74"
        fill="none"
        stroke={stroke}
        strokeWidth={0.5}
        strokeLinecap="round"
        opacity={0.4}
      />
      <path
        d="M 82 78 Q 72 70 62 74"
        fill="none"
        stroke={stroke}
        strokeWidth={0.5}
        strokeLinecap="round"
        opacity={0.4}
      />
    </svg>
  );
}

export function GoalieButterflySilhouette({
  className = "",
  muted = false,
}: {
  className?: string;
  muted?: boolean;
}) {
  const fill = muted ? "rgba(12,14,20,0.35)" : "#07080c";
  const line = muted ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.26)";
  const fine = muted ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.2)";

  return (
    <svg
      viewBox="0 0 120 96"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Levý beton */}
      <path
        d="M 4 92 L 10 38 L 22 22 L 38 28 L 44 40 L 48 92 Z"
        fill={fill}
      />
      <path
        d="M 14 42 L 18 72 M 22 34 L 26 78 M 30 30 L 34 85"
        fill="none"
        stroke={fine}
        strokeWidth={0.65}
        strokeLinecap="round"
      />
      {/* Pravý beton */}
      <path
        d="M 116 92 L 110 38 L 98 22 L 82 28 L 76 40 L 72 92 Z"
        fill={fill}
      />
      <path
        d="M 106 42 L 102 72 M 98 34 L 94 78 M 90 30 L 86 85"
        fill="none"
        stroke={fine}
        strokeWidth={0.65}
        strokeLinecap="round"
      />
      {/* Tělo, ruce — butterfly */}
      <path
        d="M 44 92 L 42 52 Q 48 32 60 28 Q 72 32 78 52 L 76 92 Z"
        fill={fill}
      />
      {/* Levá ruka / blocker */}
      <path d="M 38 48 L 22 42 L 18 58 L 34 62 Z" fill={fill} />
      <path
        d="M 24 46 L 30 54"
        fill="none"
        stroke={fine}
        strokeWidth={0.55}
        strokeLinecap="round"
      />
      {/* Pravá ruka / lapačka */}
      <path d="M 82 48 L 98 44 L 102 58 L 86 64 Z" fill={fill} />
      <path
        d="M 92 50 Q 96 54 94 58"
        fill="none"
        stroke={fine}
        strokeWidth={0.55}
        strokeLinecap="round"
      />
      {/* Hlava + maska */}
      <ellipse cx="60" cy="26" rx="15" ry="17" fill={fill} />
      {/* Mřížka masky */}
      <path
        d="M 48 24 L 72 24 M 50 20 L 50 32 M 60 18 L 60 34 M 70 20 L 70 32 M 52 28 L 68 28"
        fill="none"
        stroke={line}
        strokeWidth={0.85}
        strokeLinecap="round"
      />
      <path
        d="M 52 30 Q 60 33 68 30"
        fill="none"
        stroke={fine}
        strokeWidth={0.6}
        strokeLinecap="round"
      />
      {/* Hůl mezi betony */}
      <path d="M 57 55 L 52 90 L 60 91 L 65 56 Z" fill={fill} />
      <path
        d="M 54 86 L 38 94"
        fill="none"
        stroke={line}
        strokeWidth={0.9}
        strokeLinecap="round"
      />
      <path
        d="M 40 93 L 28 96"
        fill="none"
        stroke={fine}
        strokeWidth={0.7}
        strokeLinecap="round"
      />
    </svg>
  );
}
