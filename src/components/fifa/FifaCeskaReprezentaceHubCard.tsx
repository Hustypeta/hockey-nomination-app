"use client";

import { FifaCeskaReprezentaceCardArt } from "@/components/fifa/FifaCeskaReprezentaceCardArt";
import { FifaHubMenuCard } from "@/components/fifa/FifaHubMenuCard";

export function FifaCeskaReprezentaceHubCard() {
  return (
    <div className="block w-full min-h-[13rem] lg-device:h-full lg-device:min-h-0" aria-disabled="true">
      <FifaHubMenuCard
        title="Česká reprezentace"
        art={<FifaCeskaReprezentaceCardArt />}
        preparing
        preparingOnly
        centerTitle
      />
    </div>
  );
}
