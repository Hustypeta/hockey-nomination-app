import { SiteBackground } from "@/components/site/SiteBackground";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export function SiteShell({
  children,
  showFooter = true,
}: {
  children: React.ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div className="relative min-h-screen bg-[#05080f] text-white">
      <SiteBackground />
      <SiteHeader />
      <div className="relative z-10">{children}</div>
      {showFooter ? (
        <div className="relative z-10">
          <SiteFooter />
        </div>
      ) : null}
    </div>
  );
}
