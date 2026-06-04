# Větve

| Větev | Účel |
|-------|------|
| `main` | **Produkce** — to, co je na webu a co se deployuje |
| `feature/fifa-redesign` | Nový FIFA UI — **nemergovat** do `main`, dokud není schválené spuštění |

## Vyhodnocení fantasy / pick'em (produkce)

```powershell
git checkout main
git pull origin main
# skripty, .env s produkční DB, deploy jen z main
```

## FIFA redesign (lokálně / preview)

```powershell
git checkout feature/fifa-redesign
npm run dev
```

## Spuštění FIFA na webu (až budeš ready)

```powershell
git checkout main
git merge feature/fifa-redesign
# push main → deploy
```
