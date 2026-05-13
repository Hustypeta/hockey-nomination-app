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
    <div className="relative min-h-screen bg-transparent text-white">
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
