import Link from "next/link";

import { ChevronLeft } from "lucide-react";

import { FifaAppPage } from "@/components/fifa/FifaAppPage";

import { FifaExtraligaDraftFantasyCardArt } from "@/components/fifa/FifaExtraligaDraftFantasyCardArt";

import { FifaRepreHeroHeadline } from "@/components/fifa/FifaRepreHeroHeadline";

import {

  EXTRALIGA_DRAFT_FANTASY_HEADLINE,

  EXTRALIGA_DRAFT_FANTASY_SEASON,

} from "@/lib/fifa/extraligaDraftFantasy";

import { FIFA_KICKER, FIFA_LINK } from "@/lib/fifa/fifaUiClasses";



export function FifaExtraligaDraftFantasyContent() {

  return (

    <FifaAppPage>

      <div className="flex h-full min-h-0 flex-col">

        <Link

          href="/souteze"

          className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold lg:text-sm ${FIFA_LINK}`}

        >

          <ChevronLeft className="h-4 w-4" aria-hidden />

          Zpět

        </Link>



        <div className="fifa-card fifa-card-hero relative mt-4 flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:min-h-[30rem] lg:min-h-[34rem] lg:p-6">

          <FifaExtraligaDraftFantasyCardArt />

          <div className="fifa-hub-menu-card__focus-scrim pointer-events-none absolute inset-0 z-[6] opacity-60" aria-hidden />

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">

            <p className={FIFA_KICKER}>Připravujeme</p>

            <div className="fifa-repre-hero-headline mt-3">

              <FifaRepreHeroHeadline

                as="h1"

                title={EXTRALIGA_DRAFT_FANTASY_HEADLINE}

                subtitle={EXTRALIGA_DRAFT_FANTASY_SEASON}

              />

            </div>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--fifa-text-secondary)] lg:text-base">

              Soutěž připravujeme. Brzy zde bude draft fantasy české extraligy.

            </p>

          </div>

        </div>

      </div>

    </FifaAppPage>

  );

}

