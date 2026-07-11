"use client";

import { Bookmark } from "lucide-react";

export function AccountCollectionsSection() {
  return (
    <section className="fifa-account-section">
      <div className="fifa-account-section__head">
        <div>
          <h2 className="fifa-account-section__title">Sbírky hráčů</h2>
          <p className="fifa-account-section__desc">Tvoje vlastní sbírky a album hráčů</p>
        </div>
      </div>

      <div className="fifa-account-collections-placeholder fifa-card">
        <div className="fifa-account-collections-placeholder__icon" aria-hidden>
          <Bookmark className="h-8 w-8" />
        </div>
        <h3 className="fifa-account-collections-placeholder__title">Sbírky hráčů připravujeme</h3>
        <p className="fifa-account-collections-placeholder__text">
          Brzy si tu budeš moci ukládat oblíbené hráče, sledovat jejich nominace a sestavovat vlastní alba.
        </p>
      </div>
    </section>
  );
}
