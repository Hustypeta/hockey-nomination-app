import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { FifaCeskaReprezentaceHubCard } from "@/components/fifa/FifaCeskaReprezentaceHubCard";
import { FifaExtraligaDraftFantasyHubCard } from "@/components/fifa/FifaExtraligaDraftFantasyHubCard";
import { FifaHistoricalLineupHubCard } from "@/components/fifa/FifaHistoricalLineupHubCard";
import { FifaPageHeader } from "@/components/fifa/FifaPageHeader";

export function FifaSoutezeHubContent() {
  return (
    <FifaAppPage>
      <div className="flex min-h-0 flex-col max-lg-device:h-auto lg-device:h-full">
        <FifaPageHeader kicker="Rozcestí" title="Soutěže" />
        <div className="fifa-souteze-hub-grid mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg-device:min-h-0 lg-device:flex-1 lg-device:grid-cols-3 lg-device:gap-4">
          <FifaCeskaReprezentaceHubCard />
          <FifaExtraligaDraftFantasyHubCard />
          <FifaHistoricalLineupHubCard />
        </div>
      </div>
    </FifaAppPage>
  );
}
