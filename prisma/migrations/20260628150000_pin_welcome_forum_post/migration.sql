-- Připnout uvítací staff příspěvek na fóru (pokud existuje).
UPDATE "community_posts"
SET
  "pinnedAt" = COALESCE("pinnedAt", NOW()),
  "isStaffPost" = true
WHERE "deletedAt" IS NULL
  AND "status" = 'PUBLISHED'
  AND (
    "slug" = 'vitejte-na-forum-lineup'
    OR "slug" LIKE 'vitejte-na-forum-lineup-%'
    OR "title" ILIKE 'Vítejte na fórum%'
  );
