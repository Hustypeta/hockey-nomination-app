import { FifaAppShell } from "@/components/fifa/FifaAppShell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { isFifaDesignEnabled } from "@/lib/fifa/fifaDesignEnabled";

export function SiteShell({ children, showFooter = true }: { children: React.ReactNode; showFooter?: boolean }) {
  if (isFifaDesignEnabled()) {
    return (
      <div className="fifa-app-viewport">
        <FifaAppShell>{children}</FifaAppShell>
        {showFooter ? <div className="relative z-10 shrink-0"><SiteFooter /></div> : null}
      </div>
    );
  }
  return (
    <div className="relative min-h-screen bg-transparent text-white">
      <SiteHeader />
      <div className="relative z-10">{children}</div>
      {showFooter ? <div className="relative z-10"><SiteFooter /></div> : null}
    </div>
  );
}
