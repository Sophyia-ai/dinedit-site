# WRITE-PLAN — Track 1 : Header global + routes (Dinédit V2)

> **Objectif** : header/menu conforme brief §2/§3, **présent sur TOUTES les pages** (home incluse) + créer les 5 routes.
> **Méthode** : branche dédiée → build vert → **certif Codex (lecture seule)** → validation Raoul → merge `main`. Le site est live (`dinedit.events`), non-régression obligatoire.
> **Périmètre** : structure/nav/routes seulement. Le **contenu** des pages = Track 2 ; le **module membre/paiement** = Track 5. Les nouvelles pages sont des **stubs** en Track 1.

## État actuel (grounding, code lu le 2026-07-26)
- `routing.tsx:52` : **Home rendue hors `Layout`** (enfant direct de `Root`) → pas de header global. `Root` (routing.tsx:29-36) rend déjà `AnaisBubble` + `CookieBanner` + `Legal` (globaux ✅).
- `Layout.tsx:13,17` : `Layout` = `<Navigation/>` + `<main pt-20 max-w-6xl>` + `<Footer/>`, wrappe `agenda` + `architectes` seulement.
- `Home.tsx:96` : Home rend **son propre `<Footer/>`** (donc footer déjà présent partout).
- `Navigation.tsx` : **3 items** (home, agenda[accent], architectes) **inline sur desktop** (`hidden lg:flex`, l.67), burger **mobile only** (l.89 `lg:hidden`), **langue dans le panneau replié** (l.116-118). `architectes` → `openAnaisWithArchitectes` (chat entry, l.41-45).

## Changements (fichier par fichier)

### 1. `src/routing.tsx` — header global + nouvelles routes
- **Déplacer `<Navigation/>` dans `Root`** (avant `<Outlet/>`, l.31) → header sur **toutes** les pages, home incluse. Le retirer de `Layout`.
- **Routes** (dans les `contentRoutes` wrappés par `Layout`, + variantes langue existantes l.58-60) :
  - garder `agenda` (= onglet « Dîners inédits »).
  - ajouter `devenir-membre`, `entreprises`, `a-propos`, `contact`, `faq`.
  - `architectes` : redirection **applicative SPA** via `<Navigate to="a-propos" replace/>` (client) **+ vrai 301 SEO** dans `staticwebapp.config.json` (cf. §6). ⚠️ Un `<Navigate>` React ne produit **pas** de 301 — le 301 SEO doit être au niveau Azure/edge (**correctif Codex #1**).

### 2. `src/components/Layout.tsx` — retirer la nav (désormais globale)
- Retirer `<Navigation/>` (l.13). Garder `<main pt-20 …><Outlet/></main>` + `<Footer/>`. (Home garde son propre Footer — pas de double, Nav n'est plus qu'une seule fois via Root.)

### 3. `src/components/Navigation.tsx` — refonte header (§3)
- **Menu derrière une ICÔNE sur TOUS les viewports** : supprimer le bloc inline desktop `hidden lg:flex` (l.67-87) ; l'icône burger devient visible partout (retirer `lg:hidden` l.89).
- **Panneau latéral (drawer)** au clic (au lieu du dropdown replié) : les **5 onglets** dans un panneau qui s'ouvre depuis la droite, esprit épuré.
- **Accessibilité du drawer — OBLIGATOIRE (sinon régression clavier, correctif Codex #4)** : fermeture **Échap** · **clic sur l'overlay** ferme · **verrouillage du scroll `body`** à l'ouverture (restauré à la fermeture) · **focus trap** dans le panneau + **retour du focus** sur l'icône menu à la fermeture · `aria-expanded`/`aria-controls` sur le bouton, `role="dialog"`/`aria-modal` sur le panneau.
- **5 onglets** : Dîners inédits (`/agenda`) · Devenir membre (`/devenir-membre`) · Entreprises (`/entreprises`) · À propos (`/a-propos`) · Contact (`/contact`).
- **Langue (`LanguagePill`) TOUJOURS visible** à côté de l'icône menu (haut-droite), **hors du drawer**, états ouvert **et** fermé (§3). Retirer la langue de l'intérieur du panneau (l.116-118).
- **Icône compte** (`lucide User`) à côté de l'icône menu → pointera vers l'espace membre (Track 5) ; pour l'instant lien placeholder vers `/devenir-membre`.
- **Logo** haut-gauche → home (conservé, l.63-65).
- **Variant transparent** quand on est en haut de la home (overlay sur `VideoHero`) vs solide ailleurs / au scroll (ne pas casser l'immersif).
- **Retirer** `architectes → openAnaisWithArchitectes` (le chat n'est plus point d'entrée — cf. Track 2/4).

### 4. `src/pages/` — stubs des nouvelles pages
- Créer `DevenirMembre.tsx`, `Entreprises.tsx`, `Contact.tsx`, `Faq.tsx` (coquilles minimales : titre + placeholder « contenu à venir Track 2 »).
- `Architectes.tsx` → renommer/refondre en `APropos.tsx` (stub À propos). Garder l'import à jour dans `routing.tsx`.

### 5. `src/locales/{fr,en,nl}/common.json` — libellés nav
- Ajouter `nav.diners` (« Dîners inédits » / « Signature dinners » / « Bijzondere diners »), `nav.membre`, `nav.entreprises`, `nav.apropos`, `nav.contact`, `nav.account` (aria). Retirer/replacer `nav.architectes`.

### 6. `staticwebapp.config.json` — 301 SEO (correctif Codex #1)
- Ajouter une règle de **redirect 301** `/architectes` (et `/{lang}/architectes`) → `/a-propos` (`statusCode: 301`). C'est le vrai 301 SEO ; le `<Navigate>` de §1 ne couvre que le rendu client.

### 7. `src/sections/VideoHero.tsx` + `src/sections/Scenes.tsx` — retirer le double top bar (correctif Codex #2)
- **VideoHero.tsx (l.43-56)** : retirer le top bar overlay (logo + `LanguagePill variant="overlay"`) — désormais fourni par la `Navigation` globale.
- **Scenes.tsx (l.95-97)** : retirer le top bar overlay (logo).
- Nettoyer les imports devenus inutiles (`LanguagePill`, `Logo`/`logoPath` si plus référencés) pour ne pas casser le build (`noUnusedLocals`).
- ⚠️ Sans ça = **triple header superposé** sur la home. La `Navigation` globale (variant transparent) remplace ces 2 top bars.

### 8. `src/sections/Footer.tsx` — lien FAQ + fix architectes (correctif Codex #3)
- Ajouter un **lien `/faq`** dans la colonne « Navigation » du footer (présent sur toutes les pages, §2 du brief).
- Le lien actuel vers `/architectes` (l.68-70) → **`/a-propos`**.

## Critères d'acceptation (vérif avant push)
- [ ] `npx tsc --noEmit` + `vite build` **verts**.
- [ ] **Home reste immersive** : `VideoHero` visible, header en **overlay transparent** en haut, pas de décalage/pt-20 parasite.
- [ ] Header **identique et global** sur toutes les pages (home + contenu).
- [ ] **Icône menu** ouvre le **panneau latéral** avec les **5 onglets** (tous viewports) ; navigation OK vers les 5 pages (stubs).
- [ ] **Langue FR/EN/NL toujours visible** (états ouvert/fermé) + bascule fonctionnelle sur les 3 langues.
- [ ] **Icône compte** présente.
- [ ] `AnaisBubble` toujours présente partout ; `/agenda` toujours OK ; `architectes` redirige vers `a-propos`.
- [ ] **Pas de double/triple header** sur la home (top bars `VideoHero`/`Scenes` retirés — correctif #2).
- [ ] **Lien FAQ dans le footer** (toutes pages — correctif #3).
- [ ] **301** `/architectes`→`/a-propos` dans `staticwebapp.config.json` (correctif #1).
- [ ] **Drawer accessible** : Échap, clic overlay, scroll-lock body, focus trap (correctif #4).

## Sécurité / non-régression
- Branche **`refonte/dinedit-v2-track1`** (jamais `main` direct).
- Build vérifié en local avant tout push.
- **Certif Codex** (lecture seule) sur ce plan + le diff.
- Merge `main` **après validation Raoul** → deploy SWA. Rollback = `git revert` du merge.
- **Hors périmètre Track 1** (ne pas toucher) : contenu/copy des pages, CTA (§6), gabarit fiche (§7 = moteur), Anaïs (§8), module membre/paiement (§4/§9).
