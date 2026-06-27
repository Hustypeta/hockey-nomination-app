import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { FIFA_KICKER } from "@/lib/fifa/fifaUiClasses";

export function FifaComingSoonContent({ title, subtitle = "Sekci připravujeme. Brzy tu bude plné rozhraní." }: { title: string; subtitle?: string }) {
  return (
    <FifaAppPage>
      <div className="flex h-full min-h-0 flex-col items-center justify-center px-4 text-center">
        <p className={FIFA_KICKER}>Připravujeme</p>
        <h1 className="mt-3 max-w-xl font-display text-3xl tracking-tight text-[var(--fifa-text)] lg:text-4xl">{title}</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--fifa-text-secondary)] lg:text-base">{subtitle}</p>
      </div>
    </FifaAppPage>
  );
}
