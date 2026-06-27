import { FifaAppShell } from "@/components/fifa/FifaAppShell";

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fifa-design-viewport">
      <FifaAppShell designPreview>{children}</FifaAppShell>
    </div>
  );
}
