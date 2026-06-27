"use client";



import Link from "next/link";

import { useCallback, useEffect, useState, type MouseEvent } from "react";

import { ChevronRight, Flag } from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { FifaCeskaReprezentaceCardArt } from "@/components/fifa/FifaCeskaReprezentaceCardArt";

import { FifaExtraligaDraftFantasyCardArt } from "@/components/fifa/FifaExtraligaDraftFantasyCardArt";
import { FifaHistoricalLineupCardArt } from "@/components/fifa/FifaHistoricalLineupCardArt";

import { FifaPreparingHint, FifaRepreMenuNav } from "@/components/fifa/FifaHubMenuCard";

import { FifaHomeCarouselNav } from "@/components/fifa/FifaHomeCarouselNav";

import { FifaRepreHeroHeadline } from "@/components/fifa/FifaRepreHeroHeadline";

import { CESKA_REPREZENTACE_MENU_ITEMS } from "@/lib/fifa/ceskaReprezentaceMenuItems";

import {
  EXTRALIGA_DRAFT_FANTASY_HEADLINE,
  EXTRALIGA_DRAFT_FANTASY_SEASON,
  EXTRALIGA_DRAFT_FANTASY_TITLE,
} from "@/lib/fifa/extraligaDraftFantasy";
import {
  HISTORICAL_LINEUP_HEADLINE,
  HISTORICAL_LINEUP_SUBTITLE,
  HISTORICAL_LINEUP_TITLE,
} from "@/lib/fifa/historicalLineup";



type SoutezArt = "ceska-reprezentace" | "extraliga-draft-fantasy" | "historical-lineup";



type SoutezPreview = {

  href: string;

  title: string;

  subtitle?: string;

  badge?: string;

  icon: LucideIcon;

  art?: SoutezArt;

  hoverMenu?: boolean;

  heroTitle?: boolean;

  heroSubtitle?: string;

  preparing?: boolean;

};



const SOUTEZE_PREVIEWS: SoutezPreview[] = [

  {

    href: "/souteze",

    title: "Česká reprezentace",

    icon: Flag,

    art: "ceska-reprezentace",

    hoverMenu: true,

  },

  {

    href: "/souteze/extraliga",

    title: EXTRALIGA_DRAFT_FANTASY_HEADLINE,

    heroSubtitle: EXTRALIGA_DRAFT_FANTASY_SEASON,

    icon: Flag,

    art: "extraliga-draft-fantasy",

    heroTitle: true,

    preparing: true,

  },

  {

    href: "/souteze/historical-lineup",

    title: HISTORICAL_LINEUP_HEADLINE,

    heroSubtitle: HISTORICAL_LINEUP_SUBTITLE,

    icon: Flag,

    art: "historical-lineup",

    heroTitle: true,

    preparing: true,

  },

];



const ROTATE_MS = 5500;



function SoutezSlideArt({

  preview,

  fade,

}: {

  preview: SoutezPreview;

  fade: boolean;

}) {

  const fadeClass = `transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`;



  if (preview.art === "ceska-reprezentace") {

    return (

      <div className={`absolute inset-0 z-0 ${fadeClass}`} aria-hidden>

        <FifaCeskaReprezentaceCardArt />

      </div>

    );

  }



  if (preview.art === "extraliga-draft-fantasy") {

    return (

      <div className={`absolute inset-0 z-0 ${fadeClass}`} aria-hidden>

        <FifaExtraligaDraftFantasyCardArt />

      </div>

    );

  }



  if (preview.art === "historical-lineup") {

    return (

      <div className={`absolute inset-0 z-0 ${fadeClass}`} aria-hidden>

        <FifaHistoricalLineupCardArt />

      </div>

    );

  }



  const Icon = preview.icon;

  return <Icon className={`fifa-card-watermark h-24 w-24 ${fadeClass}`} aria-hidden />;

}



export function FifaHomeSoutezeCarousel({ compact = false }: { compact?: boolean }) {

  const [index, setIndex] = useState(0);

  const [fade, setFade] = useState(true);

  const [paused, setPaused] = useState(false);

  const [repreMenuOpen, setRepreMenuOpen] = useState(false);

  const showArrows = SOUTEZE_PREVIEWS.length > 1;



  const goToIndex = useCallback(

    (next: number) => {

      const i = ((next % SOUTEZE_PREVIEWS.length) + SOUTEZE_PREVIEWS.length) % SOUTEZE_PREVIEWS.length;

      if (i === index) return;

      setFade(false);

      setTimeout(() => {

        setIndex(i);

        setFade(true);

      }, 200);

    },

    [index],

  );



  const step = useCallback(

    (delta: number) => (e: MouseEvent<HTMLButtonElement>) => {

      e.preventDefault();

      e.stopPropagation();

      goToIndex(index + delta);

    },

    [goToIndex, index],

  );



  useEffect(() => {

    if (SOUTEZE_PREVIEWS.length < 2 || paused) return;

    let swap: ReturnType<typeof setTimeout> | undefined;

    const t = setInterval(() => {

      setFade(false);

      swap = setTimeout(() => {

        setIndex((i) => (i + 1) % SOUTEZE_PREVIEWS.length);

        setFade(true);

      }, 280);

    }, ROTATE_MS);

    return () => {

      clearInterval(t);

      if (swap) clearTimeout(swap);

    };

  }, [paused]);



  useEffect(() => {

    setRepreMenuOpen(false);

  }, [index]);



  const current = SOUTEZE_PREVIEWS[index]!;

  const Icon = current.icon;

  const hasHoverMenu = current.hoverMenu === true;

  const hasHeroLayout = hasHoverMenu || current.heroTitle === true;

  const isPreparing = current.preparing === true;

  const isClickable = !hasHoverMenu;

  return (

    <article

      className={`fifa-card fifa-card--interactive fifa-home-souteze-carousel group relative flex h-full min-h-[5.5rem] flex-col overflow-hidden lg:min-h-0 ${

        hasHeroLayout

          ? `fifa-card-hero fifa-repre-hub-card fifa-hub-menu-card fifa-home-souteze-repre fifa-home-souteze-repre--touch${isPreparing ? " fifa-hub-menu-card--preparing" : ""}${repreMenuOpen ? " fifa-hub-menu-card--menu-open" : ""}`

          : ""

      } ${compact ? "p-3" : "p-4 lg:p-5"}`}

      onMouseEnter={() => setPaused(true)}

      onMouseLeave={() => setPaused(false)}

    >

      {isClickable ? (

        <Link

          href={current.href}

          aria-label={`Otevřít soutěž: ${
            current.art === "extraliga-draft-fantasy"
              ? EXTRALIGA_DRAFT_FANTASY_TITLE
              : current.art === "historical-lineup"
                ? HISTORICAL_LINEUP_TITLE
                : current.title
          }`}

          className="absolute inset-0 z-10"

        />

      ) : null}



      <SoutezSlideArt preview={current} fade={fade} />



      {hasHoverMenu ? (

        <button

          type="button"

          className="fifa-hub-menu-card__tap-target"

          aria-expanded={repreMenuOpen}

          aria-label={repreMenuOpen ? "Skrýt menu Česká reprezentace" : "Zobrazit menu Česká reprezentace"}

          onClick={(e) => {

            e.preventDefault();

            e.stopPropagation();

            setRepreMenuOpen((open) => !open);

          }}

        />

      ) : null}



      {hasHeroLayout ? (

        <div className="fifa-hub-menu-card__focus-scrim pointer-events-none absolute inset-0 z-[6]" aria-hidden />

      ) : null}



      <div

        className={`relative z-[11] flex min-h-0 flex-1 flex-col transition-opacity duration-300 ${

          isClickable ? "pointer-events-none" : ""

        } ${hasHoverMenu ? "fifa-hub-menu-card__content" : ""} ${fade ? "opacity-100" : "opacity-0"}`}

      >

        <div className="fifa-home-souteze-chrome">

          <p className="fifa-kicker fifa-home-souteze-kicker flex items-center gap-2">

            <span className="fifa-icon-chip">

              <Flag className="h-3.5 w-3.5" aria-hidden />

            </span>

            Soutěže

          </p>

          {showArrows ? (

            <span className="fifa-meta fifa-home-souteze-index tabular-nums">

              {index + 1}/{SOUTEZE_PREVIEWS.length}

            </span>

          ) : (

            <div className="fifa-home-souteze-dots flex gap-1" aria-hidden>

              {SOUTEZE_PREVIEWS.map((_, i) => (

                <span

                  key={i}

                  className={`h-1 rounded-full transition-all duration-300 ${

                    i === index ? "w-4 bg-[var(--fifa-accent)]" : "w-1 bg-[var(--fifa-border-strong)]"

                  }`}

                />

              ))}

            </div>

          )}

        </div>



        <div

          className={`fifa-home-souteze-body flex min-h-0 flex-1 flex-col ${

            hasHeroLayout ? "justify-start gap-0" : "justify-between pt-7"

          } ${showArrows ? "fifa-home-carousel-content--nav" : ""}`}

        >

        <div

          className={

            hasHeroLayout

              ? "fifa-repre-hero-headline fifa-repre-hero-headline--top fifa-home-souteze-repre__headline fifa-image-text-layer shrink-0 px-2"

              : "min-h-0 shrink-0"

          }

        >

          {hasHeroLayout ? (

            <FifaRepreHeroHeadline title={current.title} subtitle={current.heroSubtitle} />

          ) : (

            <>

              <div className="flex items-center gap-2">

                <Icon

                  className={`shrink-0 text-[var(--fifa-accent-text)] ${compact ? "h-4 w-4" : "h-5 w-5"}`}

                  aria-hidden

                />

                {current.badge ? (

                  <span className={`fifa-badge ${current.badge === "Aktivní" ? "fifa-badge--live" : ""}`}>

                    {current.badge}

                  </span>

                ) : null}

              </div>

              <h2

                className={`font-display leading-tight text-[var(--fifa-text)] mt-1.5 ${

                  compact ? "text-sm lg:text-base" : "text-xl lg:text-2xl"

                }`}

              >

                {current.title}

              </h2>

              {current.subtitle ? (

                <p className="mt-1 line-clamp-2 text-xs leading-snug text-[var(--fifa-text-secondary)]">

                  {current.subtitle}

                </p>

              ) : null}

            </>

          )}

        </div>



        {hasHoverMenu ? (

          <FifaRepreMenuNav

            items={CESKA_REPREZENTACE_MENU_ITEMS}

            ariaLabel="Kategorie české reprezentace"

            className="fifa-home-souteze-repre__menu !max-w-[min(100%,15rem)] sm:!max-w-[58%]"

            onNavigate={() => setRepreMenuOpen(false)}

          />

        ) : isPreparing ? (

          <FifaPreparingHint className="fifa-home-souteze-preparing" />

        ) : (

          <span

            className={`relative inline-flex items-center gap-0.5 font-semibold text-[var(--fifa-accent-text)] ${

              compact ? "mt-1 text-[10px]" : "mt-3 text-xs"

            }`}

          >

            Otevřít soutěž

            <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />

          </span>

        )}

        </div>

      </div>



      {showArrows ? (

        <FifaHomeCarouselNav

          onPrev={step(-1)}

          onNext={step(1)}

          prevLabel="Předchozí soutěž"

          nextLabel="Další soutěž"

          variant="chrome"

          align="full"

        />

      ) : null}

    </article>

  );

}


