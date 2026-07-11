"use client";

import Link from "next/link";
import { Loader2, Trophy } from "lucide-react";
import { useContestStanding } from "@/hooks/useContestStanding";
import { useFantasyStanding } from "@/hooks/useFantasyStanding";
import { contestRankHeadline, formatContestPointsOfMax } from "@/lib/contestRankDisplay";
import { FIFA_BTN_SECONDARY } from "@/lib/fifa/fifaUiClasses";

function ContestResultCard({
  kicker,
  title,
  rank,
  pointsLabel,
  participants,
  leaderboardHref,
  podium,
}: {
  kicker: string;
  title: string;
  rank: number;
  pointsLabel: string;
  participants: number;
  leaderboardHref: string;
  podium: boolean;
}) {
  return (
    <article className={`fifa-account-contest-tile fifa-card${podium ? " fifa-lb-row--podium" : ""}`}>
      <div className="fifa-account-contest-tile__icon" data-podium={podium || undefined}>
        {rank === 1 ? <span aria-hidden>🏆</span> : <Trophy className="h-5 w-5" aria-hidden />}
      </div>
      <div className="fifa-account-contest-tile__body">
        <p className="fifa-account-contest-tile__kicker">{kicker}</p>
        <h3 className="fifa-account-contest-tile__title">{title}</h3>
        <p className="fifa-account-contest-tile__stats">
          <span className="fifa-account-contest-tile__points">{pointsLabel}</span>
          <span> · {rank}. z {participants}</span>
        </p>
      </div>
      <Link href={leaderboardHref} className={`${FIFA_BTN_SECONDARY} fifa-account-contest-tile__link`}>
        Žebříček
      </Link>
    </article>
  );
}

export function AccountContestsSection() {
  const { standing: contest, loading: contestLoading } = useContestStanding();
  const { standing: fantasy, loading: fantasyLoading } = useFantasyStanding();

  const loading = contestLoading || fantasyLoading;

  const contestCard =
    contest.published &&
    contest.participant &&
    contest.rank != null &&
    contest.points != null ? (
      <ContestResultCard
        kicker="Soutěž o dres"
        title={contestRankHeadline(contest.rank)}
        rank={contest.rank}
        pointsLabel={
          contest.maxPoints != null
            ? formatContestPointsOfMax(contest.points, contest.maxPoints)
            : `${contest.points} bodů`
        }
        participants={contest.totalParticipants}
        leaderboardHref="/zebricek"
        podium={contest.rank <= 3}
      />
    ) : null;

  const fantasyCard =
    fantasy.published && fantasy.participant && fantasy.rank != null && fantasy.points != null ? (
      <ContestResultCard
        kicker="Fantasy MS 2026"
        title={contestRankHeadline(fantasy.rank)}
        rank={fantasy.rank}
        pointsLabel={`${fantasy.points} bodů`}
        participants={fantasy.totalParticipants}
        leaderboardHref="/zebricek?soutez=fantasy"
        podium={fantasy.rank <= 3}
      />
    ) : null;

  const hasResults = Boolean(contestCard || fantasyCard);

  return (
    <section className="fifa-account-section">
      <div className="fifa-account-section__head">
        <div>
          <h2 className="fifa-account-section__title">Moje soutěže</h2>
          <p className="fifa-account-section__desc">Výsledky v soutěžích, kterých ses zúčastnil</p>
        </div>
      </div>

      {loading ? (
        <div className="fifa-account-section__loading">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--fifa-accent-text)]" aria-hidden />
        </div>
      ) : !hasResults ? (
        <p className="fifa-account-section__empty">
          Zatím nemáš výsledek v žádné soutěži.{" "}
          <Link href="/souteze" className="text-[var(--fifa-accent-text)] hover:underline">
            Prohlédnout soutěže
          </Link>
          .
        </p>
      ) : (
        <div className="fifa-account-contest-tiles">
          {contestCard}
          {fantasyCard}
        </div>
      )}
    </section>
  );
}
