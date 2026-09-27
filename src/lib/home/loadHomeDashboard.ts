import { listCommunityMembers } from "@/lib/community/listCommunityMembers";
import { listPublishedPosts } from "@/lib/community/listPublishedPosts";
import type { CommunityMemberDto, CommunityPostDto } from "@/lib/community/types";
import { getContestStatsSnapshot } from "@/lib/contestStats";
import { enrichDailyNewsImages } from "@/lib/dailyNews/enrichImages";
import { fetchDailyNewsForHome } from "@/lib/dailyNews/fetchDailyNews";
import { DAILY_NEWS_HOME_COUNT } from "@/lib/dailyNews/feeds";
import type { DailyNewsItem } from "@/lib/dailyNews/types";

export const HOME_FORUM_POST_LIMIT = 5;

export type HomeDashboardData = {
  communityUsersCount: number | null;
  members: CommunityMemberDto[];
  forumPosts: CommunityPostDto[];
  dailyNews: DailyNewsItem[];
};

export async function loadHomeDashboard(): Promise<HomeDashboardData> {
  const [stats, members, forumPosts, dailyNewsRaw] = await Promise.all([
    getContestStatsSnapshot(),
    listCommunityMembers().catch(() => [] as CommunityMemberDto[]),
    listPublishedPosts({
      sort: "new",
      take: HOME_FORUM_POST_LIMIT,
      userId: null,
    }).catch(() => [] as CommunityPostDto[]),
    fetchDailyNewsForHome()
      .then((items) => enrichDailyNewsImages(items, DAILY_NEWS_HOME_COUNT))
      .catch(() => [] as DailyNewsItem[]),
  ]);

  return {
    communityUsersCount: stats.communityUsersCount,
    members,
    forumPosts,
    dailyNews: dailyNewsRaw.slice(0, DAILY_NEWS_HOME_COUNT),
  };
}
