# CLAUDE.md / AGENTS.md — Sophyia-Chat (coordination CC & Codex)

> **Auto-chargé** : Claude Code lit `CLAUDE.md`, Codex lit `AGENTS.md`, depuis le répertoire
> courant + parents. Ces 2 fichiers sont IDENTIQUES et présents à la racine locale ET dans
> chaque repo GitHub (api, admin, widget, sites/*). **Source canonique = racine `Sophyia-Chat/`.
> Ne pas faire diverger les copies : toute modif se propage à toutes.**
>
> Lis-le EN ENTIER avant de coder. Il prime sur tes habitudes par défaut.

## 0. 🔒 SÉCURITÉ — PORTE D'ENTRÉE (obligatoire)
Avant tout code sur un site/app/API/widget/bot ou un flux auth/données :
👉 lis et applique **`POLITIQUE-SECURITE-DEFAULT.md`** (racine + chaque repo).
Rien n'est « terminé » tant que la **checklist SEC-\*** applicable n'est pas verte (ou dérogée
par Raoul avec date de remédiation).

## 1. ✅ PRE-FLIGHT — AVANT DE TOUCHER UNE APP (obligatoire)
Tu ne codes RIEN tant que tu n'as pas, POUR L'APP concernée :
1. **Identifié le repo/dossier exact** où tu interviens (cf §7).
2. **Lu son INDEX** : `docs/index.txt` (liste des docs + rôle de chacun) = point d'entrée. Manquant → tu le crées.
3. **Lu sa doc canonique de chantier** (plan/journal du repo — cf §1bis).
4. **Lu ses WARNINGS / landmines** : `docs/WARNINGS.md` si présent, sinon §6 ici.
5. **Lu son README** + `CHANGELOG`/journal éventuels.
6. **Lu la mémoire projet** + les `<system-reminder>` (contexte à VÉRIFIER, pas à croire).
7. **Vérifié la donnée/le code RÉELS** (jamais supposer — cf §4).

### 1bis. Où est la doc de chaque app
| App / repo | INDEX / docs | Doc canonique |
|---|---|---|
| `api/` | `api/docs/index.txt` | `PLAN-refonte-admin-bonjour.md`, `PHASE3-WRITE-PLAN.md`, `SUPABASE-AUTH-WRITE-PLAN.md` |
| `admin/app` | `admin/docs/index.txt` | `admin/*.md` (ARCHITECTURE, PLANNING) |
| `widget/` | `widget/docs/index.txt` | `AUDIT-CSS-WIDGET.md` |
| `sites/villaoliveyou-site` | `docs/index.txt` | `docs/OLIVIA-PLAN.md` |
| `sites/dinedit-site` | `docs/index.txt` | `docs/DINEDIT-PLAN.md` |
| nouveau site | `sites/<client>/docs/index.txt` | à créer au bootstrap |

## 1ter. ✍️ POST-FLIGHT — APRÈS TON TRAVAIL, COMPLÉTER LA DOC (obligatoire)
Avant de considérer une tâche finie, POUR L'APP concernée :
1. **Mets à jour la doc canonique** (journal daté : fait / décidé / déployé / commits / reste).
2. **Complète/actualise `docs/index.txt`** : chaque doc listé `nom — rôle (1 ligne)`. Nouveau
   doc → ajouté ; obsolète → marqué.
3. **Ajoute tout piège rencontré** dans `docs/WARNINGS.md` (crée-le s'il manque).
4. **Mémoire projet** à jour si décision durable.
> **Une app ne se quitte jamais moins bien documentée qu'à l'arrivée.** `index.txt` reflète
> toujours l'état réel des docs.

## 2. La constellation — qui fait quoi
- **CC « site »** : sites clients + widget côté site. **CC « bonjour »** : plateforme/admin + tenants.
- **`api/function_app.py`** = fichier PARTAGÉ : jamais deux fenêtres qui y écrivent en même temps. Séquencer.
- **Codex** = audit/certif **lecture seule**, adversarial (findings 🔴/🟠/🟡 + exploit + fix). Ne code jamais, ne déploie jamais.

## 3. Workflow imposé (aucune étape sautée)
Audit → write-plan (doc canonique) → **certif Codex** (si auth/données/sécu/partagé) → **backup**
(`git tag stable-pre-…-<ts>` + snapshot blob si données) → **branche dédiée** (JAMAIS master/main
direct) → code + build/compile → **vérif** (bots répondent, login OK, invariants) → **validation
Raoul** → deploy (merge → GHA) → **vérif LIVE** → doc/mémoire (§1ter). Rollback prêt à chaque cran.

## 4. Règles d'or (non négociables)
- **Zéro rupture** : sites ET bots répondent avant/pendant/après.
- **Vérifier la donnée live**, jamais supposer (même une affirmation de Codex).
- **Byte-per-byte** sur fichiers partagés ; widget master → **3 copies** synchro identiques.
- **Expliquer** en 1 ligne toute action sensible/cross-repo AVANT de la lancer.
- **UN doc canonique par chantier** — jamais de doc parallèle.
- **JAMAIS `Co-Authored-By`** dans commits/PR.
- Migration risquée = **expand/contract** (rétro-compatible d'abord, contracter après).

## 5. Certification Codex
On certifie le **write-plan** ET le **code réel** avant deploy prod sur les zones sensibles
(auth, données tenant, `function_app.py`, widget). Message read-only, posture d'attaquant.

## 6. ⚠️ LANDMINES & ERREURS À NE PAS REFAIRE
- **Supposer au lieu de vérifier** : « villa et raoul partagent un email » (FAUX) ; « polite-plant
  est un provisoire à retirer » (FAUX = CNAME vivant du site). → lire la donnée/DNS/code RÉELS.
- **`create_client` écrasait le blob** d'un bot_id existant → garde-fou `exists()` fail-closed.
- **Identité par email** (delete/update supprimait plusieurs bots) → tout par `bot_id`.
- **`save_settings` auto-traduit** welcome_fr → EN/DE/IT (peut écraser des versions peaufinées).
- **Supabase** : Site URL défaut `localhost:3000` casse le retour OAuth → poser le vrai domaine + Redirect URLs.
- **`function_app.py`** partagé : coordination, py_compile, non-régression La Gare, byte-per-byte.
- **Widget** : master + 3 copies, propagation identique.
- **CORS double allowlist** Azure : code (`ALLOWED_ORIGINS`) ET plateforme (`az functionapp cors`).
- **CSRF** : cookie `SameSite=None` → check Origin obligatoire sur les actions admin mutantes.

## 7. Cartographie repos & déploiement
| Repo | Rôle | Deploy |
|---|---|---|
| `sophyia-chat-api` (`api/`) | Azure Functions (auth, admin, chat, blob) | GHA push→master |
| `sophyia-chat-admin` (`admin/app`) | Admin `bonjour.sophyia.io` | Azure SWA push→master |
| `sophyia-chat-widget` (`widget/`) | Widget master (+ 3 copies) | source de vérité |
| `villaoliveyou-site`, `dinedit-site` (`sites/*`) | Sites clients | Azure SWA push→main |

Blob `sophyiachat9d27` / container `sophyia-chat-data` (`az … --auth-mode key`) ;
`_system/users.json` = registre comptes (bot_id-keyed).

## 8. Auth & isolation (état 2026-07)
Identité `bot_id`. **Clients** : Google + magic-link (Supabase, projet dédié). **Super-admin** :
mdp only (refusé via Supabase). `create_client` non destructif, actions par bot_id, pas
d'auto-provisioning, cookie `HttpOnly; Secure; SameSite=None` + CSRF.

## 9. Onboarding nouveau client
Site clonable (`site.ts`) → tenant (`create_client` bot_id) → knowledge → `save_settings`
(personality.type) → CORS (code + plateforme) → **crée `docs/index.txt` + `docs/WARNINGS.md`** →
SEC-* → deploy.

## 10. Définition de « TERMINÉ »
Doc de l'app **LUE** (§1) **ET COMPLÉTÉE** + `docs/index.txt` à jour (§1ter) + **SEC-\* verte** +
**vérifié LIVE** + mémoire à jour + **validé Raoul**. Sinon : **pas terminé.**
