export function PlaceholderLeaderboardPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-[10rem] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-[#0c0e14]/80 px-4 py-8 text-center">
      <p className="max-w-[16rem] text-[11px] leading-relaxed text-slate-400 lg:text-xs">{message}</p>
    </div>
  );
}
