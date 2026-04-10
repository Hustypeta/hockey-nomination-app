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
    <div className="min-h-screen bg-[#05080f] text-white">
      <SiteBackground />
      <SiteHeader />
      {children}
      {showFooter ? <SiteFooter /> : null}
    </div>
  );
}
