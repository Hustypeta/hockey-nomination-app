"use client";

import { TipsportPartnerBanner } from "@/components/marketing/TipsportPartnerBanner";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { FifaHomeEditorCard } from "@/components/fifa/FifaHomeEditorCard";
import { FifaHomeDailyNews } from "@/components/fifa/FifaHomeDailyNews";
import { FifaHomeNovinkyCard } from "@/components/fifa/FifaHomeNovinkyCard";
import { FifaHomeForumPostsCard } from "@/components/fifa/FifaHomeForumPostsCard";
import { FifaHomeKomunitaCard } from "@/components/fifa/FifaHomeKomunitaCard";
import { FifaHomeSoutezeCarousel } from "@/components/fifa/FifaHomeSoutezeCarousel";
import { HomeSeoIntro } from "@/components/seo/HomeSeoIntro";

export function FifaHomeContent() {
  return (
    <FifaAppPage className="!p-3 max-lg-device:pb-8 lg-device:!p-4">
      <div className="fifa-home-board">
        <div className="fifa-home-stage">
          <div className="fifa-home-page">
            {/* Levý sloupec: editor + tipsport */}
            <div className="fifa-home-col">
              <div className="fifa-home-card-slot fifa-home-slot fifa-home-slot--editor min-h-0">
                <FifaHomeEditorCard compact />
              </div>
              <div className="fifa-partner-slot fifa-home-slot fifa-home-slot--tipsport shrink-0">
                <TipsportPartnerBanner compact className="fifa-design-tipsport-compact !mt-0" />
              </div>
            </div>

            {/* Pravý sloupec: 2 řady */}
            <div className="fifa-home-col-right">
              {/* Horní řada: Lineup News + Novinky */}
              <div className="fifa-home-row-2">
                <div className="fifa-home-card-slot fifa-home-slot fifa-home-slot--lineup-news min-h-0">
                  <FifaHomeDailyNews />
                </div>
                <div className="fifa-home-card-slot fifa-home-slot fifa-home-slot--novinky min-h-0">
                  <FifaHomeNovinkyCard />
                </div>
              </div>

              {/* Dolní řada: Komunita+Fórum stack + Soutěže */}
              <div className="fifa-home-row-2">
                <div className="fifa-home-stack-2">
                  <div className="fifa-home-card-slot fifa-home-slot fifa-home-slot--komunita min-h-0">
                    <FifaHomeKomunitaCard />
                  </div>
                  <div className="fifa-home-card-slot fifa-home-slot fifa-home-slot--forum min-h-0">
                    <FifaHomeForumPostsCard />
                  </div>
                </div>
                <div className="fifa-home-card-slot fifa-home-slot fifa-home-slot--souteze min-h-0">
                  <FifaHomeSoutezeCarousel />
                </div>
              </div>
            </div>
          </div>
        </div>

        <HomeSeoIntro />
      </div>
    </FifaAppPage>
  );
}
