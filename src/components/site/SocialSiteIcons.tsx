import type { ReactNode } from "react";
import {
  SITE_FACEBOOK_PAGE_URL,
  SITE_INSTAGRAM_PAGE_URL,
  SITE_TIKTOK_PAGE_URL,
} from "@/lib/siteBranding";

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 11-2.89-2.89c.08 0 .15.01.23.02V12.4a6.33 6.33 0 00-.23-.03 6.26 6.26 0 106.26 6.26V8.53a8.16 8.16 0 004.85 1.58v-3.45a4.85 4.85 0 01-1-.09z" />
    </svg>
  );
}

function SocialIconLink({
  href,
  label,
  title,
  circleClassName,
  children,
}: {
  href: string;
  label: string;
  title: string;
  circleClassName: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={label}
      className={`flex shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/25 hover:bg-white/[0.1] hover:text-white ${circleClassName}`}
    >
      {children}
    </a>
  );
}

function SocialIconPlaceholder({
  label,
  networkName,
  circleClassName,
  children,
}: {
  label: string;
  networkName: string;
  circleClassName: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-label={label}
      title={`${networkName} — již brzy`}
      className={`flex shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-white/28 ${circleClassName}`}
    >
      {children}
    </span>
  );
}

export type SocialSiteIconsProps = {
  /** Větší kruhy — např. hero (odkazové bloky jako u brand Instagramu). Patička ponechává výchozí. */
  size?: "default" | "lg";
  /**
   * Instagram profilu Lineup (`NEXT_PUBLIC_INSTAGRAM_PAGE_URL` na Railway).
   * Kanál Svět Hokeje je zvlášť (text / tlačítko na úvodu), ne tato ikona.
   */
  showInstagram?: boolean;
};

export function SocialSiteIcons({ size = "default", showInstagram = true }: SocialSiteIconsProps) {
  const fb = SITE_FACEBOOK_PAGE_URL.trim();
  const ig = showInstagram ? SITE_INSTAGRAM_PAGE_URL.trim() : "";
  const tt = SITE_TIKTOK_PAGE_URL.trim();

  const lg = size === "lg";
  const circleClassName = lg
    ? "h-14 w-14 border-[1.5px] sm:h-[4.25rem] sm:w-[4.25rem]"
    : "h-10 w-10";
  const iconCls = lg ? "h-7 w-7 sm:h-8 sm:w-8" : "h-[1.125rem] w-[1.125rem]";
  const navGap = lg ? "gap-4 sm:gap-6" : "gap-3";

  return (
    <nav aria-label="Sociální sítě" className={`flex justify-center ${navGap}`}>
      {fb ? (
        <SocialIconLink href={fb} label="Facebook — Lineup na Facebooku" title="Facebook" circleClassName={circleClassName}>
          <IconFacebook className={iconCls} />
        </SocialIconLink>
      ) : (
        <SocialIconPlaceholder label="Facebook zatím bez odkazu" networkName="Facebook" circleClassName={circleClassName}>
          <IconFacebook className={iconCls} />
        </SocialIconPlaceholder>
      )}
      {ig ? (
        <SocialIconLink href={ig} label="Instagram — Lineup" title="Instagram Lineup" circleClassName={circleClassName}>
          <IconInstagram className={iconCls} />
        </SocialIconLink>
      ) : (
        <SocialIconPlaceholder label="Instagram — již brzy" networkName="Instagram" circleClassName={circleClassName}>
          <IconInstagram className={iconCls} />
        </SocialIconPlaceholder>
      )}
      {tt ? (
        <SocialIconLink href={tt} label="TikTok" title="TikTok" circleClassName={circleClassName}>
          <IconTikTok className={iconCls} />
        </SocialIconLink>
      ) : (
        <SocialIconPlaceholder label="TikTok — již brzy" networkName="TikTok" circleClassName={circleClassName}>
          <IconTikTok className={iconCls} />
        </SocialIconPlaceholder>
      )}
    </nav>
  );
}
