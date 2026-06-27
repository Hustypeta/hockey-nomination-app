/** Ukázková data pro dlaždici „Pozvi kamaráda“ na homepage — později nahradit API / sdílení odkazu. */
export type HomeFriendReferralPreview = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  summary: string;
};

export const HOME_FRIEND_REFERRAL_PREVIEW: HomeFriendReferralPreview[] = [
  {
    id: "invite",
    tag: "Hokej Lineup",
    title: "Pozvi kamaráda",
    subtitle: "Pošli mu odkaz na hokejlineup.cz",
    summary: "Ať se zaregistruje, sestaví nominaci a zapojí se do soutěží stejně jako ty.",
  },
];
