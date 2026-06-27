import { FifaAppPage } from "@/components/fifa/FifaAppPage";

import { FifaCeskaReprezentaceHubCard } from "@/components/fifa/FifaCeskaReprezentaceHubCard";

import { FifaExtraligaDraftFantasyHubCard } from "@/components/fifa/FifaExtraligaDraftFantasyHubCard";

import { FifaHistoricalLineupHubCard } from "@/components/fifa/FifaHistoricalLineupHubCard";

import { FifaPageHeader } from "@/components/fifa/FifaPageHeader";



export function FifaSoutezeHubContent() {

  return (

    <FifaAppPage>

      <div className="flex h-full min-h-0 flex-col">

        <FifaPageHeader kicker="Rozcestí" title="Soutěže" />

        <div className="fifa-souteze-hub-grid mt-4 grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">

          <FifaCeskaReprezentaceHubCard />

          <FifaExtraligaDraftFantasyHubCard />

          <FifaHistoricalLineupHubCard />

        </div>

      </div>

    </FifaAppPage>

  );

}

