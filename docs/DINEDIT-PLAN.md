# Chantier Dinedit — état & cadrage

> Document de cadrage du futur chantier Dinedit (3e client Sophyia après La Gare Cully et Villa Olive You). Format aligné sur `sites/villaoliveyou-site/docs/OLIVIA-PLAN.md` — UN doc par chantier, mis à jour à chaque session significative.

## Vue d'ensemble

Dinedit (`https://dinedit.be`) est une marque belge d'événements **art × gastronomie en lieux insolites** : dîners inédits, événements sur mesure BtoB et BtoC, ~20 convives, €150–185 par place. Concept Aman/Pinault à la belge — différenciant fort, mais le site actuel **ne sert pas la promesse**.

Constat brut Raoul : *« un gros machin qui ne met pas en valeur les events et les personnes qui les organisent »*.

## État au 2026-06-30 — audit site existant

### Stack actuelle

- **WordPress** (indices : `wp-content`)
- **WooCommerce** (panier, wishlist, « Add to Cart », bons-cadeaux)
- **Elementor** + thème commercial **ThemeRex**
- Pas custom, lourd, peu modulable, performance non auditée mais probablement faible (typique WP+Elementor).

### Promesse, modèle, cible

| Item | État |
|---|---|
| Pitch | *« L'alchimie de la rencontre, l'art de créer des expériences uniques. »* Art + gastronomie en lieux insolites, refus du formatage standard. |
| Cibles | Entreprises (afterwork, lancements), particuliers (dîners intimes, soirées privées), collectionneurs d'expériences exclusives. |
| Modèle BtoB | Événements sur mesure pour entreprises. |
| Modèle BtoC | Vente individuelle de places (€150–185) + bons-cadeaux (€150). |
| Format événement | ~20 convives, bi-mensuel pour les « dîners inédits ». |

### Faiblesses (= leviers de mise en valeur)

| Faiblesse | Pourquoi ça coûte cher |
|---|---|
| **Humains invisibles** | Chefs, artistes, vignerons cités globalement. Zéro bio, zéro photo individuelle, zéro storytelling. La promesse « rencontre » est trahie : on ne rencontre personne. |
| **Témoignages génériques** | Prénoms seuls (« Marie », « Jean ») = faux signaux de confiance, contre-productif sur du haut-de-gamme. |
| **Mono-langue FR** | Belgique = bilingue FR+NL minimum. Bruxelles = clientèle EN très forte (expatriés, sièges européens, finance). Au moins 3 langues attendues. |
| **Aucun chatbot / aucune qualification** | Événements sur mesure = besoin de qualification (date, nombre, lieu préféré, budget, type d'expérience). Aujourd'hui : juste un mailto et un WhatsApp. Friction maximale. |
| **Vidéo non exploitée** | Asset « Modern Video Catering » mentionné mais non scénarisé. |
| **CTA dispersés** | mailto + boutons différents + WhatsApp, sans hiérarchie. Diluent l'intention. |
| **« My Account »** | Présent mais peu explicite — fonction WooCommerce orpheline du parcours. |

### Forces à conserver

- ✅ Concept « lieux insolites » + « art × gastronomie » est différenciant et premium.
- ✅ Prix transparents (€150–185) — bonne pratique BtoC.
- ✅ Bons-cadeaux = excellent levier viral (acquisition par tiers).
- ✅ Tunnel WooCommerce checkout fonctionne (à ne pas casser sans raison forte).

### Inconnues à clarifier avec Raoul

1. **Rôle Raoul** : propriétaire de Dinedit ? consultant accompagnant ? client Sophyia ? mandataire prospect ? → conditionne autonomie, budget, délai.
2. **Périmètre demandé** : mise en valeur + chatbot OU refonte intégrale.
3. **Langues à prévoir** : FR seul / FR+NL / FR+NL+EN / FR+NL+EN+DE.
4. **Identité du chatbot** : nom (Aria ? Édith ? Bruna ? — proposition à valider), posture (concierge, curateur d'expériences, hôte de maison), palette (alignée Dinedit).
5. **Budget temps** : MVP rapide en surcouche ou refonte de fond.
6. **SEO historique** : volume actuel de trafic SEO Dinedit ? Si élevé → refonte impose plan redirections 301 strict (coût SEO non négligeable). À vérifier dans Google Search Console / Bing Webmaster du domaine actuel.

## Trois pistes — à arbitrer avec Raoul

### Piste A — Surcouche minimale sur WordPress existant (~3-5 jours)

- Garder WP + WooCommerce + Elementor + ThemeRex.
- Ajouts :
  - **Widget chatbot Sophyia** (master `widget/sophyia-chat.js`) en `<script>` dans le `<head>` WordPress, configuré pour le tenant `dinedit`.
  - **Page « Les Architectes »** (chefs + artistes + vignerons + sommeliers partenaires) : créée comme custom post type WP avec bios + photos individuelles.
  - **Module témoignages enrichis** : photos, prénom+nom (ou pseudo signé), contexte de l'événement.
- Avantages : rapide, conserve SEO historique, peu disruptif.
- Inconvénients : hérite des lourdeurs WP. Performance limitée.

### Piste B — Refonte complète stack Sophyia (~3-4 semaines)

- React/Vite + Azure SWA + Azure Functions API + chatbot natif + blog auto + multilingue 3-7 langues (réplique exacte du pattern Villa Olive You).
- Avantages : site rapide, modulable, prestige cohérent. Templating capitalisé pour les chantiers suivants.
- Inconvénients : **perte du SEO existant** à reconstruire. Plan de redirections 301 strict obligatoire (chaque URL WP → URL React). Migration WooCommerce → ?
- Question majeure : si on garde la vente en ligne, comment ? Re-coder un tunnel checkout ? Garder WooCommerce uniquement pour le checkout, en sous-domaine `shop.dinedit.be` ?

### Piste C — Hybride (~1-2 semaines)

- Tunnel WooCommerce **conservé** sur un sous-domaine `shop.dinedit.be` (ou même chemin `/shop/`) → on ne touche pas à ce qui marche pour l'achat.
- Front-end vitrine (`dinedit.be`) **reconstruit en React/Vite + Azure SWA** : home, page « Architectes », page « Événements », chatbot natif, blog auto, multilingue.
- Liens fluides depuis la vitrine vers `/shop` pour la conversion BtoC. BtoB reste qualifié par le chatbot puis transmis par mail à Dinedit.
- Avantages : combine résilience commerciale + prestige vitrine + capitalisation Sophyia.
- Inconvénients : 2 stacks à maintenir, mais le périmètre WP devient stable (juste le checkout, plus de bricolage Elementor pour la home).

## Réutilisable depuis Villa Olive You

Hors choix de piste, voici ce qui se transpose **sans réinventer**. Évite la dispersion : c'est le **système Sophyia** qui mûrit, pas du one-shot.

### Composants techniques

| Brique | Localisation Villa | Adaptation Dinedit |
|---|---|---|
| Widget master `sophyia-chat.js` | `widget/sophyia-chat.js` (master) | Réutilisé tel quel. Tenant `dinedit` configuré côté API. Couleur à choisir (palette Dinedit). |
| `SophyiaChat.openWith(message)` | Ajouté pour Villa | Réutilisable pour les liens markdown blog → chat contextuel |
| API CORS double allowlist | `api/function_app.py` `ALLOWED_ORIGINS` + Azure platform | Ajouter `https://dinedit.be`, `https://www.dinedit.be`, le hostname SWA provisoire des deux côtés (ne pas oublier la plateforme Azure App Service — gotcha rencontré sur Villa) |
| `automation/blog_engine.py` | `sites/villaoliveyou-site/automation/` | Copier. Ajuster `CATEGORY_META`, `COUSIN_CATS`, `REWRITE_PROMPT` (identité Dinedit), `BASE_URL`. Le mode pure LLM, la porte de rejet, l'anti-redondance, le maillage SEO et la régénération sitemap sont génériques. |
| `automation/template.html` | idem | Copier + repalette + adapter widget src/data-bot/data-color. |
| `automation/feeds.json` | idem | Repartir de zéro — sources RSS pertinentes pour le concept Dinedit (gastronomie créative belge, art contemporain, vignerons partenaires, scènes culinaires Bruxelles/Anvers/Gand). |
| `.github/workflows/blog.yml` | `sites/villaoliveyou-site/.github/workflows/` | Copier. Schedules à ajuster selon rythme désiré. |
| `regenerate_sitemap()` + STATIC_PAGES | `blog_engine.py` | Repartir des constantes, ajuster la liste des pages statiques Dinedit. |
| `robots.txt` AI-friendly (20 crawlers) | `sites/villaoliveyou-site/public/robots.txt` | Copier tel quel, changer juste le `Sitemap:`. |
| `llms.txt` | `sites/villaoliveyou-site/public/llms.txt` | Réécrire (pages + pitch Dinedit). |
| Pattern JSON-LD | `sites/villaoliveyou-site/index.html` | Adapter — pas `LodgingBusiness` mais probablement `LocalBusiness` / `EventVenue` / `Restaurant` ou un mix. JSON-LD `Event` à utiliser pour chaque dîner programmé. |
| Structure 7 locales | `sites/villaoliveyou-site/src/locales/` | Repartir des keys, repeupler les valeurs Dinedit. Au minimum FR/NL/EN. |
| Page satellite `/journal` + lien footer discret | Stratégie Villa (parade chat down + SEO) | Réplicable si pertinent pour Dinedit. |

### Patterns pratiques (process)

| Sujet | Leçon Villa à appliquer |
|---|---|
| Création SWA | Ne **PAS** utiliser `--login-with-github` (device flow interactif, échoue en CI/script). `az staticwebapp create` nu suffit. Workflow GHA déjà en place dans le repo. |
| Secret token | Toujours via stdin pipe : `az staticwebapp secrets list ... -o tsv \| gh secret set ...`. Jamais en argument (visible dans `ps`). |
| CORS | **Toujours penser aux 2 niveaux** : code Python `ALLOWED_ORIGINS` + plateforme Azure (`az functionapp cors add`). Le préflight OPTIONS dépend du niveau plateforme. |
| Blog engine push | `--push` opt-in, jamais opt-out. `git add` scopé. Porte de rejet + anti-redondance dans le prompt. |
| DNS OVH (si Dinedit a un setup similaire) | Supprimer les A/TXT résiduels parking avant d'ajouter le CNAME. Apex → redirection 301 web OVH vers www. Mails MX/SPF à préserver. |
| Google Search Console | Domain property + DNS TXT (plus solide qu'URL-prefix). Soumettre sitemap après vérification. |
| Bing Webmaster | Gratuit, IndexNow inclus (Bing/Yandex/Naver). |
| Documentation | UN doc `*-PLAN.md` par chantier, format aligné sur `OLIVIA-PLAN.md`. Mis à jour à chaque session significative. |

## Décisions ouvertes

- **Stack cible** : A / B / C à arbitrer après réponse aux 6 inconnues ci-dessus.
- **Identité du chatbot Dinedit** : nom, posture, palette. Brief de cadrage style HANDOFF à rédiger une fois la stack actée.
- **Knowledge base du chatbot** : Dinedit a-t-il une bible / argumentaire / FAQ existant à transformer en `knowledge-dinedit.md` (pattern Villa) ?
- **Catégories blog auto** : à dessiner après cadrage. Pistes : « Architectes » (humains), « Lieux insolites », « Carnet de cave » (vignerons partenaires), « Création » (art × table), « Coulisses » (making-of d'événements passés).
- **Modèle LLM** : tenant `dinedit` → garder global `gpt-4o-mini` au démarrage, voir crédits.

### Saisie autonome events Serge — Option A actée

**Validé Raoul** : la saisie autonome se fera côté `bonjour.sophyia.io` (rubrique Events à développer avec l'autre CC). Serge ira où on l'emmène — pas besoin d'adapter à un outil pré-existant côté Dinédit. Le développement de cette rubrique se coordonne avec l'autre CC quand il aura terminé la création tenant.

### Knowledge Anaïs sur les events précis — à automatiser

**Exigence Raoul** : Anaïs doit toujours connaître les events précis (dates, lieux, artistes/chefs, prix) **sans qu'on doive ré-uploader son knowledge à chaque ajout d'event**.

Mécanique en 3 niveaux :

1. **MVP (maintenant)** — fiches `events/upcoming/*.json` dans le repo. Le `knowledge-anais.md` contient un **bloc dynamique « Événements à venir »** régénéré au build. CC site re-upload le knowledge complet au CC bonjour.sophyia à chaque event ajouté/modifié.
2. **Phase moyen terme (après squelette site)** — endpoint `/api/events/list?bot=dinedit` lit depuis le blob admin. **Tools function-calling** d'Anaïs : `get_upcoming_events()` + `get_event_by_slug(slug)`. Elle les appelle quand un visiteur demande un détail event. Plus de re-upload manuel du knowledge à chaque event — seul le socle stable reste dans `submit_text`.
3. **Long terme** — webhook de l'admin → rebuild auto du bloc events dans le knowledge + `submit_text` programmatique. Zéro intervention humaine.

## Phase 0 — décisions actées (2026-06-30, validées Raoul)

| Décision | Tranche |
|---|---|
| **Piste** | **B — refonte complète stack Sophyia.** Raoul est en charge de la refonte (relation directe). |
| **Langues** | **FR, EN, NL** (Belgique bilingue + clientèle internationale Bruxelles). Pas de DE/IT/RU/HE comme Villa, pas de RTL à gérer. |
| **Chatbot** | Nom **Anaïs**. Posture comparable à Olivia (Aman + chaleur) mais **transposée à l'événementiel** : curatrice / hôte d'expériences art × gastronomie. Accueil complet 3 langues. |
| **Périmètre** | **Full événementiel.** Le site EST l'agenda. Le blog n'est pas un à-côté éditorial — c'est le cœur du parcours. |
| **SEO existant** | Zéro. Tout est à construire — pas de plan de redirections 301 à gérer (la refonte n'efface aucun trafic existant). |
| **Délai** | « Hier ». MVP rapide, jalons courts, livré en plusieurs phases sans tout attendre. |

### Architecture cible (décidée Raoul)

- **Blog = agenda d'events.** Chaque article = un événement (passé OU futur).
- **Rubrique « Events » toujours mise en avant** (priorité visuelle home + filtre par défaut).
- **Tri/filtre principal** : À venir / Passés. Les anciens restent indexés (capital SEO + preuve sociale + recurrence).
- **Depuis chaque article-event** : CTA *Demande de participation* qui bifurque vers **BtoB** ou **BtoC** (deux parcours distincts).
- **Stripe** : compte Dinedit existant. À relier — orientation prise : **Payment Links Stripe** par event pour BtoC (paiement immédiat), **Stripe Invoicing** ou Payment Link sur mesure après qualification Anaïs pour BtoB. À détailler en Phase 3.
- **Distinction BtoB / BtoC** : signalée tôt dans le parcours (CTA, copy, chatbot qualifie dès le 2e échange).

### Mapping concret avec Villa Olive You

| Brique Villa | Brique Dinedit |
|---|---|
| Olivia (concierge villa) | **Anaïs** (curatrice events) |
| `personality.type="villa"` | `personality.type="events"` (à créer côté API) |
| `LodgingBusiness` JSON-LD | `Organization` + JSON-LD **`Event`** par article-event |
| 5 catégories blog (bien-être / tables / mariages / etc.) | Catégories events à définir Phase 2 (pistes : *Dîners inédits*, *Lieux insolites*, *Sur mesure*, *Carnet de cave*) |
| 7 langues / RTL HE | 3 langues, pas de RTL |
| Cron blog Lun+Jeu | Cron events à définir — peut-être hebdomadaire **manuel** (publication d'event = acte éditorial Dinedit, pas auto-RSS) |
| Booking → `/booking` form mail | **Participation → Stripe Payment Link (BtoC) ou form qualifié (BtoB)** |
| Olivia couche 2 : météo + directions + sources OT | Anaïs : à définir Phase 4 — pistes : météo Bruxelles (event outdoor), itinéraires lieux insolites, agenda culturel BE pour recommandation croisée |

### Nuance importante — events ≠ blog RSS

Le `blog_engine.py` de Villa pioche dans des flux RSS et **réécrit**. Pour Dinedit, le mécanisme s'inverse : **les events sont créés par Dinedit (curation interne), pas pioché ailleurs**. Donc :

- Pas de `feeds.json` pour les events futurs — les events sont **saisis** (admin ou directement en JSON/MD).
- Le moteur Sophyia génère le HTML statique multilingue + JSON-LD `Event` + maillage SEO **à partir d'une saisie structurée**, pas d'un flux externe.
- En revanche, on peut **garder un mécanisme RSS optionnel** pour un sous-blog éditorial Dinedit (portraits chefs, carnet de cave, making-of) — à arbitrer Phase 2.

## Plan d'exécution — 4 phases

### Phase 1 — squelette React + Anaïs minimale (~3-4 jours)

- Créer repo `sites/dinedit-site` (GitHub `Sophyia-ai/dinedit-site`).
- Copier l'arbo `villaoliveyou-site` comme base : `src/`, `public/`, `automation/`, `.github/`.
- Repalette : palette Dinedit (à définir — sans charte fournie, partir de la palette du site actuel).
- 3 locales (`fr/`, `en/`, `nl/`) — supprimer `de/it/ru/he`.
- `siteConfig.scenes` : 4-6 scènes immersives représentatives (events passés / lieux insolites).
- Brief Anaïs : rédiger `knowledge-anais.md` style `knowledge-villaoliveyou-v2.md` (identité, posture, périmètre, règle de qualification BtoB/BtoC).
- Tenant API : `create_client` pour `bot_id=dinedit`, `personality.type=events` (nouveau type, à brancher dans `function_app.py`).
- CORS double allowlist : `https://dinedit.be`, `https://www.dinedit.be`, hostname SWA provisoire.
- Création SWA Azure (commande nue, pas `--login-with-github` — leçon Villa) + secret token.
- DNS Dinedit : audit zone actuelle (registrar à identifier), CNAME `www` vers SWA, redirection apex 301 vers `www`.
- Site live sur l'URL provisoire `.azurestaticapps.net` puis `dinedit.be` final.

### Phase 2 — agenda events (~3-4 jours)

- `events_engine.py` (variante du `blog_engine.py`) : pas de RSS, prend des fichiers JSON/MD `events/upcoming/*.json` et `events/past/*.json`, génère HTML statique multilingue + JSON-LD `Event` + maillage SEO.
- Champs structurés event : `slug`, `title`, `date_start`, `date_end`, `location_name`, `location_address`, `capacity`, `price_btoc`, `price_btob_min`, `chef`, `artist`, `description`, `images`.
- Section `<Agenda />` home (équivalent du `<Blog />` Villa) — filtre par défaut « À venir », switch « Passés ».
- Page satellite `/agenda` (parade chat-down + SEO) — lien discret footer (« Carnet d'Anaïs » ou « Tous les dîners »).
- JSON-LD `Event` complet par article (date, location, organizer, offers, performer).
- Sitemap dynamique + hreflang 3 langues.

### Phase 3 — participation BtoB/BtoC + Stripe (~2-3 jours)

- Formulaire `<ParticipationForm />` côté article-event : étape 1 = BtoB ou BtoC (toggle), étape 2 = nb personnes / date souhaitée (si event sur mesure) / message.
- **BtoC** : Stripe Payment Link par event. Saisi dans le JSON de l'event (champ `stripe_payment_link_btoc`). Bouton « Réserver ma place » ouvre le lien Stripe Checkout → success → redirect site.
- **BtoB** : pas de paiement direct. Form transmis à `villa.dinedit@...` (à confirmer) + notification Anaïs. Suivi par Dinedit, devis, Stripe Invoicing ou Payment Link sur mesure.
- Anaïs côté chat : capable d'aider à comprendre la différence BtoB / BtoC et de pousser vers le bon parcours.

### Phase 4 — SEO complet + lancement (~1-2 jours)

- `robots.txt` AI-friendly (template Villa).
- `llms.txt` Dinedit.
- Sitemap : pages + events upcoming + events past + 3 langues hreflang.
- Google Search Console + Bing Webmaster (vérification DNS TXT — pattern Villa).
- IndexNow ping côté `events_engine.py` à chaque publication (Bing + Yandex + Naver).
- Tests d'acceptation : 3 langues OK, Anaïs répond, BtoC checkout fonctionne, BtoB form arrive bien chez Dinedit, JSON-LD `Event` validé via Google Rich Results Test.

## Décisions complémentaires actées (2026-06-30)

| Point | Décision |
|---|---|
| **Palette / charte** | Déduite du site actuel (noir/blanc + accent bordeaux apparent). **Logo récupéré côté Raoul** (à glisser dans `sites/dinedit-site/public/images/`). |
| **Articles éditoriaux non-events** | **Oui** — sous-blog garde la place. Règles éditoriales fortes (cf. ligne *Règle anti-cannibalisation* ci-dessous). |
| **Stripe BtoC** | **Checkout dynamique** — endpoint Sophyia côté API génère une `checkout.sessions.create` à la volée. Plus propre, paramètres event en query, success/cancel callbacks site. |
| **Accès Stripe** | Récupérable par Raoul. **Au démarrage, on simule** sans accès réel (mode `STRIPE_SIMULATE=1` → l'endpoint répond avec une success page factice, le parcours UX est testable end-to-end). |
| **Mail BtoB** | Mail simple pour démarrer. **Architecture prévue pour brancher CRM plus tard** : l'endpoint de submission fait un `send_email()` + un hook `notify_crm()` no-op au début → futurs CRM via injection (Notion, HubSpot, Slack webhook, etc.) sans refactor. |
| **Photos chefs/artistes** | À récupérer depuis le site actuel (photos d'entrée existantes). Placeholders sobres au démarrage si manquant. |

### Règles éditoriales du sous-blog (acté Raoul)

- **Coller aux events** : chaque article éditorial sert un event proche dans le temps.
- **Coller au quartier** : ancrage Bruxelles / Anvers / Gand / quartier hôte de chaque event.
- **Anti-cannibalisation** : **JAMAIS** mentionner ni promouvoir un event tiers ayant lieu **à la même date** qu'un event Dinedit. Pas de fratricide d'agenda.
- **Avant l'event uniquement** : les events sont nocturnes → les recommandations « que faire autour » concernent **l'avant** (apéritif, balade, expo, transport). Pas l'après.
- **Comment se rendre** : article-type chronique qui décrit l'accès au lieu (transport public, parking, gare la plus proche, à pied depuis…).

Ces règles s'encodent dans le `REWRITE_PROMPT` du moteur éditorial (style « FORMULES CLICHÉS INTERDITES » du Villa, mais ici règles métier Dinedit).

## État des assets fournis

Dossier `sites/dinedit-site/events/` (livraison Raoul 2026-06-30) :

| Fichier | Dimensions | État | Action |
|---|---|---|---|
| `flyer25 juilklet.jpg` | 1749×2481 | ✅ Event 25 juillet | À renommer + extraire metadata. |
| `flyer29 out.jpg` | 1749×2481 | ✅ Event 29 octobre | Idem. |
| `j'adoreflyer.jpg` | 1749×2481 | ✅ Event « J'adore » | Idem. |
| `logo_dinedit.png` | 290×140 | ⚠️ Petit (raster) | Utilisable, mais idéal = SVG plus tard. À ranger `public/images/brand/` à la création repo. |
| `dinedi bon cadeau.png` | 951×1057 | ✅ Visuel bons-cadeaux | À ranger `public/images/marketing/`. |

**Important** : les flyers JPG ne contiennent que les visuels. Il manque toujours les metadata structurées par event :

```json
{
  "slug": "diner-inedit-25-juillet-2026",
  "title_fr": "...",
  "title_en": "...",
  "title_nl": "...",
  "date_start": "2026-07-25T19:30:00+02:00",
  "date_end": "2026-07-25T23:30:00+02:00",
  "location_name": "...",
  "location_address": "...",
  "location_city": "Bruxelles",
  "capacity": 20,
  "price_btoc_eur": 165,
  "price_btob_min_eur": null,
  "chef": "...",
  "artist": "...",
  "description_fr": "...",
  "description_en": "...",
  "description_nl": "...",
  "flyer_image": "/images/events/event-25-juillet-2026.jpg",
  "stripe_product_id": null
}
```

→ Phase 1 prévoit une **petite fiche de saisie** (Markdown ou form mini) pour collecter ces metadata par event. Cf. *Phase 1 ci-dessous*.

## Plan d'exécution — 4 phases (révisé)

### Phase 1 — squelette + saisie events (~3-4 jours)

- Création repo `Sophyia-ai/dinedit-site` + arbo copiée de Villa, 3 locales (FR/EN/NL), palette Dinedit (noir/bordeaux), logo importé dans `public/images/`.
- Brief Anaïs : `knowledge-anais.md` style Villa.
- Tenant API `bot_id=dinedit`, `personality.type=events` (à brancher Phase 1 dans `function_app.py`).
- CORS double allowlist Dinedit.
- SWA Azure (commande nue + secret via stdin — leçon Villa) + DNS `.be` propre.
- **Fiche de saisie event** : un fichier `events/<slug>.json` par event. Raoul remplit les 3 events à venir (à partir des flyers). Phase 1 le moteur lit ces JSON et génère le HTML statique 3 langues.

### Phase 2 — moteur événementiel `events_engine.py` (~3-4 jours)

- Variante du `blog_engine.py` Villa : pas de RSS, prend des fichiers JSON `events/upcoming/*.json` et `events/past/*.json` (déplacement auto past quand `date_end < now`).
- Génère HTML statique multilingue + **JSON-LD `Event`** par article (date, location, organizer, offers, performer, image).
- Section `<Agenda />` home (équivalent du `<Blog />` Villa) — filtre par défaut « À venir », switch « Passés ».
- Page satellite `/agenda` (parade chat-down + SEO) — lien discret footer (« Carnet d'Anaïs » ou « Tous les dîners »).
- Sitemap dynamique + hreflang 3 langues.

### Phase 2bis — sous-blog éditorial (en parallèle de Phase 2)

- Sous-moteur `blog_engine.py` allégé pour articles éditoriaux (portraits chefs, carnet de cave, comment se rendre, agenda culturel quartier).
- Pas de RSS (création éditoriale dirigée, pas auto-import).
- `REWRITE_PROMPT` enrichi des règles métier Dinedit :
  - Coller à l'event proche dans le temps.
  - Ancrage quartier.
  - **Anti-cannibalisation** : avant de mentionner un event tiers, vérifier que sa date ne chevauche pas un event Dinedit.
  - **Avant l'event uniquement** pour les recommandations connexes.

### Phase 3 — participation + Stripe Checkout dynamique (~2-3 jours)

- Composant React `<ParticipationForm />` côté article-event : étape 1 = toggle BtoB/BtoC, étape 2 = nb pers / message / contact.
- **BtoC** : endpoint Azure Functions `/api/checkout` qui appelle `stripe.checkout.sessions.create` avec les paramètres event. Mode `STRIPE_SIMULATE=1` au démarrage (success page factice). Bascule sur vrais credentials quand Raoul les fournit.
- **BtoB** : endpoint `/api/btob-request` → `send_email()` à l'adresse Dinedit + hook `notify_crm()` no-op (prêt pour injection future CRM).
- Anaïs : posture commerciale claire — qualifie BtoB vs BtoC, oriente vers le bon parcours.

### Phase 4 — SEO complet + lancement (~1-2 jours)

- `robots.txt` AI-friendly (template Villa).
- `llms.txt` Dinedit (pitch art × gastronomie événements).
- Sitemap : pages + events upcoming + events past + 3 langues hreflang.
- Google Search Console + Bing Webmaster (vérification DNS TXT).
- IndexNow ping côté `events_engine.py` à chaque publication.
- Tests d'acceptation : 3 langues OK, Anaïs répond, BtoC checkout (simulation OK), BtoB form arrive, JSON-LD `Event` validé via Google Rich Results Test.

## Les Architectes Dinedit — Serge & Fany (récit officiel)

> Matière extraite de `https://dinedit.be/a-propos/` (2026-06-30). Sert à nourrir Anaïs et à construire la page « Architectes » du nouveau site (= équivalent storytelling chefs/hôtes).

### Serge Van Mol — Bruxellois

- Formation **Beaux-Arts**.
- **Entrepreneur dans l'âme**, spécialisé événementiel pour entreprises.
- Cultive un large réseau d'**artistes, collectionneurs passionnés, chefs**.

### Fany Ramadier — Parisienne

- Issue du secteur de **l'expérience client**.
- **Consultante freelance** : stratégies durables, projets circulaires pour les entreprises.
- *« Curieuse des autres »*, aime *« faire se rencontrer des personnes de tous âges et milieux confondus »*.

### Genèse Dinédit — 2017

Inspirés par les **dîners exclusifs et le secret cinema** découverts à **New York et Londres** — des soirées qui se tiennent dans des lieux secrets. Lancent Dinédit en **2017** avec un défi : *« bousculer les conventions et changer les habitudes »*.

### Valeurs & promesse

- **Mélange des genres et des cultures** = passion fondatrice.
- **Approche intimiste**.
- **Circularité** (économie circulaire) appliquée aux événements eux-mêmes.
- Promesse implicite : *« l'aventure commence parfois à deux pas de chez soi »*.

### Localisation

Bruxelles — sièges/relais **Ixelles** et **Stalle**.

### Ce qui manque côté assets

- Photos individuelles de Serge et Fany (la page À propos ne contient qu'une photo de groupe non identifiée).
- Citations attribuées (quote signée Serge, quote signée Fany) pour la future page Architectes.

## Coordination inter-CC — protocole onboarding nouveau client

> Brief reçu de l'autre CC qui travaille sur `bonjour.sophyia.io` (panel admin). À respecter strictement pour tout nouveau tenant (Dinédit inclus).

**5 garde-fous protocole onboarding :**

1. **Identité blindée** : email dédié unique + `bot_id` neuf. **Jamais** réutiliser un email existant ni un `bot_id` existant (cicatrice raoul-baudlez fin juin : collision écrasement). **Jamais** de `delete_client` à l'aveugle.
2. **Territoires** : l'autre CC ne touche pas `function_app.py` / markers / rag_lite (backend partagé), pas La Gare, pas Olivia/villa. Il reste sur son site + son tenant.
3. **Knowledge en bloc global** : tant que l'admin ne sait pas éditer des rubriques non-restaurant, charger la connaissance en bloc via Fichiers/`submit_text`. Le chat injecte le knowledge complet → réponses correctes sans dépendre des rubriques. Refonte rubriques en seconde vague.
4. **Sauvegardes + coordination** : snapshot avant toute écriture, branche dédiée, et confirmer entre CC qu'aucun autre n'écrit en parallèle.
5. **Site propre** : widget via CDN, domaines dans `settings` (CORS), SEO carré dès le départ.

**Variables onboarding Dinédit — figées 2026-06-30 :**

| Variable | Valeur |
|---|---|
| Nom client | Dinédit (avec accent) |
| Métier | Événementiel art × gastronomie BtoB+BtoC |
| Domaine | `dinedit.be`, `www.dinedit.be` |
| `bot_id` | `dinedit` (à vérifier unique côté backend par l'autre CC) |
| Email dédié | `anais@dinedit.be` — boîte OVH **à créer par Raoul ultérieurement** (pas bloquant tant qu'aucun envoi mail n'est déclenché) |
| Langues | `fr`, `en`, `nl` |
| Identité visuelle | **Fond blanc**. Primaire **Nuit `#1B2A4A`** (BtoB sobriété, profondeur « secret cinema »). Accent **Or antique `#C9A063`** (CTA, prestige, lumière de bougie). Les flyers événement apportent leur propre coloration par-dessus. |
| Couleur bulle widget | **Or `#C9A063`** (mode bubble, équivalent du terracotta côté Villa) |

**Répartition concrète :**
- **Autre CC (bonjour.sophyia.io)** : création tenant `dinedit` côté admin + upload knowledge bloc global + paramétrage settings (domains, couleur, langues, welcomes 3 langues).
- **Ce CC (sites Dinedit)** : repo `dinedit-site`, squelette React, palette, fiches events JSON, moteur événementiel, SEO, intégration widget CDN.
- **Synchronisation** : via ce doc `DINEDIT-PLAN.md` (changelog par session) + Raoul comme arbitre quand un point touche les deux territoires.

## Prochaine étape — démarrage Phase 1

Tout est figé. Il manque juste 2 choses opérationnelles :

1. **Re-glisser proprement les 2 flyers cassés** dans `sites/dinedit-site/events/` (depuis Mail.app : clic-droit *Enregistrer sous…*).
2. **Glisser le logo Dinedit** dans `sites/dinedit-site/public/images/` (à créer Phase 1).

Sur ces 2 livraisons assets, je démarre Phase 1 : création du repo + arbo + squelette React + Anaïs minimale + tenant API + DNS + SWA. Pas besoin d'attendre Stripe ni les CRM ni les credentials — la simulation tient le parcours UX au démarrage.

---

## Journal CC bonjour.sophyia (tenant / backend)

> Entrées du CC en charge du tenant + settings + knowledge (côté admin/API). Synchro via ce doc, garde-fous onboarding respectés.

### 2026-06-30 — prep onboarding tenant `dinedit` (read-only, rien créé)

**Vérification d'unicité (garde-fous L1/L2) — tout LIBRE :**
- email `anais@dinedit.be` → absent de `_system/users.json` ✅
- bot_id `dinedit` → libre ✅ (repli `dinedit-be` libre aussi, non nécessaire)
- aucun blob `dinedit/` existant → zéro risque d'écrasement par `create_client` ✅
- (bots actuels : `la-gare-cully`, `villaoliveyou`, `raoul-baudlez`)

**Plan tenant verrouillé : `business`** (validé Raoul).

**Spec tenant prête (NON exécutée)** — à lancer dès que (1) `knowledge-anais.md` + welcomes 3 langues fournis, (2) signal « site prêt à pinger l'API » :
```
create_client : email=anais@dinedit.be, bot_id=dinedit, plan=business,
                domains=["dinedit.be","www.dinedit.be"]
save_settings : personality={type:"events", name:"Anaïs", welcome_fr/en/nl:<avec knowledge>},
                branding={mode:"bubble", color:"#C9A063", primary_color:"#C9A063"}
knowledge     : submit_text en bloc global (depuis knowledge-anais.md)
```
Process : snapshot blob → create → relecture → test login + chat → vérif que les 3 bots existants répondent toujours.

**`personality.type="events"` — sûr dès aujourd'hui :** toutes les branches backend font `if type=="villa" … else <défaut>`. Un type inconnu `events` tombe sur le **défaut neutre** (pas de tools, prompt neutre, nav restaurant en fallback) → **zéro régression La Gare**. Le **branchement events** (template/prompt dédiés dans `function_app.py`) est un changement **coordonné** (fenêtre conjointe, garde-fou « défaut restaurant inchangé byte-pour-byte ») — **je n'y touche pas en solo**.

**En attente de** : `knowledge-anais.md` + welcomes, et le signal site. D'ici là, aucun write (ni `users.json`, ni blob, ni `function_app.py`).

### 2026-06-30 (suite) — tenant `dinedit` CRÉÉ ✅ (handoff exécuté)

Snapshot avant écriture : `_system/_backups/users_20260630_214742.json` (6 entrées). Écritures via `az` (account key), 3 blobs :
- `_system/users.json` : +1 → **7 entrées**. `{email: anais@dinedit.be, bot_id: dinedit, client_name: Dinédit, plan: business, is_admin: false, domains: [dinedit.be, www.dinedit.be]}`. Mot de passe initial **aléatoire**, hashé PBKDF2v2, **non communiqué** (tenant géré en super-admin ; reset via `update_client` sans l'ancien, quand la boîte OVH existera).
- `dinedit/settings.json` : `personality{type:events, name:Anaïs, gender:feminin, welcome_fr/en/nl}` (depuis `welcomes-anais.md`), `branding{bubble, #C9A063}`, `domains`, `tagline`.
- `dinedit/knowledge.md` : `knowledge-anais.md` intégral (**12 040 chars**, ≪ limite business 100K) écrit en direct (bloc initial déterministe, pas de merge LLM). Chat l'injecte en entier (rag_lite → fallback full knowledge).

**Vérif** : 7 entrées, **3 bots existants intacts** (la-gare-cully, villaoliveyou, raoul-baudlez), smoke test `get_public_settings` OK pour les 4 (dinedit=Anaïs).

⚠️ **2 réserves qualité chat (PAS un blocage tenant)** — à lever par la branche events coordonnée :
1. Le prompt système **par défaut n'est PAS neutre, il est restaurant** (Jean-Luc / Lavaux / menu-du-jour / CHF) → Anaïs en hérite jusqu'à la branche `events`. *(Corrige ma note précédente « défaut neutre ».)*
2. `live_search` / tools gatés `is_villa` → Anaïs **n'a pas la recherche web** que son knowledge promet, tant que `events` n'est pas câblé.
→ La branche `events` doit faire **2 choses** : prompt events propre **+** câbler la recherche web. Spec prête : `BRIEF-CODEX-2-branche-events-anais.md` + squelette prompt Anaïs (transposé d'Olivia, gastronomie au centre).

**CORS** : `domains` dans settings → widget chat depuis dinedit.be OK via fallback per-tenant. Pour l'URL SWA provisoire de test : ajouter ce hostname dans `dinedit/settings.json`.domains (ou me pinguer).

---

## Journal CC site dinedit-site (frontend / contenu / SEO)

> Entrées du CC en charge du site, du contenu éditorial, du moteur événementiel et du SEO. Synchro via ce doc. Aucune écriture côté tenant/backend sans coordination explicite avec CC bonjour.sophyia.

### 2026-06-30 — cadrage + accusé réception variables tenant

**Lu, aligné avec le CC bonjour.sophyia** : variables figées + plan `business` validé + spec tenant prête + `personality.type="events"` posable sans risque (défaut neutre, zéro régression La Gare). Branchement `events` dans `function_app.py` = action conjointe ultérieure, on n'y va pas seul.

**Assets reçus côté repo `sites/dinedit-site/events/`** (Raoul, 2026-06-30) :
- 3 flyers JPG haute déf (1749×2481) — events 25 juillet, 29 octobre, « J'adore »
- Logo `logo_dinedit.png` (290×140)
- Visuel bon-cadeau `dinedi bon cadeau.png` (951×1057)

**Matière éditoriale aspirée** : page `https://dinedit.be/a-propos/` → récit Serge Van Mol (Bruxelles, Beaux-Arts, entrepreneur événementiel) + Fany Ramadier (Paris, expérience client, circularité), genèse 2017 NY/Londres, valeurs (mélange genres/cultures, intimisme, circularité). Photos individuelles manquantes — à demander à Raoul plus tard.

**Prochaine action côté CC site (à valider Raoul)** : rédiger `knowledge-anais.md` (style `knowledge-villaoliveyou-v2.md`) + welcomes 3 langues FR/EN/NL → débloque CC bonjour.sophyia pour la création tenant + upload knowledge bloc global.

**En attente côté site** : aucun blocage. Je prépare `knowledge-anais.md` + welcomes en parallèle, puis enchaîne (a) fiches events JSON et (c) squelette React selon priorité Raoul.

### 2026-06-30 (suite) — `knowledge-anais.md` + welcomes 3 langues livrés

Deux fichiers prêts à être uploadés par le CC bonjour.sophyia :

- **`sites/dinedit-site/docs/knowledge-anais.md`** (~11 ko, 114 lignes). Format aligné sur `knowledge-villaoliveyou-v2.md`. Contient : identité Anaïs (hôtesse-curatrice), comment elle travaille (qualification BtoB/BtoC naturelle, sait vs cherche), Dinédit ce qu'elle sait par cœur (concept, formats, sièges Ixelles/Stalle), Serge & Fany, règle des prix (BtoC peut donner / BtoB jamais chiffrer), esprit du sur-mesure au conditionnel, territoire (cœur Bruxelles, couronne Belgique), **3 règles éditoriales métier** (anti-cannibalisation d'agenda + avant l'event uniquement + comment se rendre), posture commerciale (jamais fermer / jamais forcer), 3 langues, distinction hors-périmètre vs hors-compétence avec variation des formules.
- **`sites/dinedit-site/docs/welcomes-anais.md`** — 3 welcomes (FR/EN/NL) qui **qualifient implicitement BtoB vs BtoC dès le premier échange** (« rejoindre un dîner » = BtoC, « composer un événement » = BtoB). Pas de mécanique « Comment puis-je vous aider ? ».

**Action attendue Raoul** : relecture rapide → ajustements éventuels → validation. Sur validation, le CC bonjour.sophyia peut récupérer ces 2 fichiers et exécuter sa spec tenant (snapshot blob → `create_client` → `save_settings` → `submit_text` → relecture → smoke test 3 bots existants).

**Prochaine étape côté site (après validation)** : enchaîner (a) fiches events JSON pour les 3 events à venir + (c) squelette repo `dinedit-site` (peut se faire en parallèle).

### 2026-06-30 (suite) — VALIDÉ Raoul, handoff CC bonjour.sophyia

Ajustements actés sur retour Raoul :
- Posture Anaïs = **maîtresse de cérémonie** (remplace « hôtesse-curatrice »).
- **Welcome scinde dès la 1re question entre particulier et société**. Si « société », Anaïs distingue au 2e échange : (a) participation en groupe à un dîner publié vs (b) organisation sur mesure par Dinédit.
- **3 parcours prix distincts** :
  - *Particulier sur dîner publié* → Anaïs **donne le prix** (info publique, 150–185 €).
  - *Société participation à dîner publié* → **même prix par personne**, c'est la **prestation** qui change ; signaler qu'il faut prévenir la maison.
  - *Société organisation sur mesure* → pas de chiffrage, transmission à Serge & Fany.

**Livraison à upload — CC bonjour.sophyia peut récupérer ces 2 fichiers :**

| Fichier | Usage |
|---|---|
| `sites/dinedit-site/docs/knowledge-anais.md` | À uploader via `submit_text` en bloc global après `create_client` |
| `sites/dinedit-site/docs/welcomes-anais.md` | Welcomes FR/EN/NL à copier dans `settings.personality.welcome_fr / welcome_en / welcome_nl` au moment du `save_settings` |

Feu vert côté site pour la spec tenant. Conditions de garde-fous L1-L5 inchangées : snapshot blob → `create_client(email=anais@dinedit.be, bot_id=dinedit, plan=business, domains=[...])` → `save_settings({personality, branding})` → `submit_text(knowledge complet)` → relecture → smoke test que les 3 bots existants (`la-gare-cully`, `villaoliveyou`, `raoul-baudlez`) répondent toujours.

**À noter pour la suite (Phase 1 site, pas pour le tenant)** : le branchement `personality.type="events"` dans `function_app.py` reste un **changement coordonné**. Tant qu'il n'est pas fait, `type="events"` tombera sur le défaut neutre (zéro régression La Gare confirmée). Anaïs sera donc « parlante » côté chat dès l'upload du knowledge + welcomes, mais avec un prompt neutre + nav restaurant en fallback. La couche dédiée events viendra dans une fenêtre conjointe ultérieure.

### 2026-06-30 (suite) — tenant Dinédit CRÉÉ ✅ (CC bonjour.sophyia) — accusé réception côté site

Lu et noté. Récap exécution côté CC bonjour.sophyia :
- **3 blobs écrits** : `users.json` (7 entrées, `dinedit/business`), `dinedit/settings.json` (type=events, Anaïs, bubble `#C9A063`, fr/en/nl), `dinedit/knowledge.md` (12 040 chars depuis `knowledge-anais.md`).
- **Garde-fous** : snapshot pris, email/bot_id neufs, aucun blob écrasé, 3 bots existants vérifiés intacts, smoke test 4 bots OK.
- **Rollback dispo** : `_system/_backups/users_20260630_214742.json`.

**Implications pour Phase 1 site (côté ce CC) :**
- Le widget Dinédit pourra pinger l'API dès l'intégration côté site.
- CORS sur `dinedit.be` + `www.dinedit.be` sera **couvert automatiquement** par le fallback per-tenant via `settings.domains` (validé CC bonjour.sophyia).
- **Pour l'URL SWA provisoire** (`<hostname>.azurestaticapps.net`) à la phase de test pré-DNS, **toujours ajouter le hostname aux 2 allowlists CORS** (code Python `ALLOWED_ORIGINS` + plateforme Azure App Service `az functionapp cors add`). **Cicatrice Villa** : le préflight `OPTIONS` dépend du niveau plateforme, à ne pas oublier (sinon Anaïs ne répondra pas depuis le SWA de test).

**Reste à coordonner (fenêtre conjointe ultérieure)** :
- **Branche `events` dans `function_app.py`** — spec prête côté CC bonjour.sophyia (`BRIEF-CODEX-2-branche-events-anais.md` + squelette prompt Anaïs). 2 actions :
  1. Prompt events propre (sinon Anaïs hérite ADN restaurant : Jean-Luc/Lavaux/menu-du-jour/CHF).
  2. Câbler `live_search` (aujourd'hui réservée à Olivia/Villa).
- **Pilotage technique** : je peux piloter le branchement (j'ai l'historique Villa `personality.type=villa` qui suit exactement le même pattern : gating strict, défaut restaurant inchangé byte-pour-byte). À déclencher quand Raoul donne le créneau et qu'aucun autre CC ne touche le fichier.
- **Pas bloquant pour Phase 1 site** : Anaïs marche déjà depuis le knowledge global. La branche events viendra l'élever au niveau « classe villa ».

**Côté site, prochaine action immédiate** : Phase 1 = création repo `Sophyia-ai/dinedit-site` + arbo squelette React + repalette nuit+or + 3 locales FR/EN/NL + intégration widget Anaïs.

### 2026-06-30 — Phase 1 squelette LIVRÉE ✅ et déployée sur SWA provisoire

**Repo + déploiement** :
- Repo `Sophyia-ai/dinedit-site` créé (public) — premier commit `3f9b383`, workflow Azure SWA `aa6fed0`.
- SWA Azure `dinedit-site` provisionnée (resource group `Sophyia-chat`, sku Free) — hostname provisoire **`kind-smoke-0fbf0a803.7.azurestaticapps.net`**.
- Secret `AZURE_STATIC_WEB_APPS_API_TOKEN_DINEDIT` injecté via stdin (no clear-text in logs).
- 2 déploiements réussis : init + fix SPA fallback (`staticwebapp.config.json` — `navigationFallback` vers `/index.html` pour React Router).
- Routes vérifiées 200 : `/`, `/agenda`, `/architectes`, `/en`, `/nl`, `/widget/widget.js`, flyers events.

**Contenu Phase 1** :
- Stack React 19 + Vite 7 + TypeScript + Tailwind + i18next (3 langues FR/EN/NL, pas de RTL).
- Palette : fond blanc + nuit `#1B2A4A` + or `#C9A063`.
- Home : hero logo + tagline + 2 CTA (BtoC `/agenda` + BtoB `/architectes`) + intro 2-colonnes.
- `/agenda` : 3 events placeholder avec flyers (`2026-07-25`, `2026-08-29`, `2026-09-25`).
- `/architectes` : Serge & Fany + genèse 2017, placeholder photos.
- Widget Anaïs intégré : `data-bot=dinedit`, `data-color=#C9A063`, mode bubble, auto-open 6 s / auto-close 10 s, skip-welcome (welcome dynamique tenant).

**CORS pipe validé** (croisé avec CC bonjour.sophyia) :
- `dinedit/settings.json.domains` → ajout `kind-smoke-0fbf0a803.7.azurestaticapps.net` (snapshot `dinedit/_backups/settings_20260630_232446.json`).
- Plateforme Azure App Service CORS → hostname ajouté aussi (par sécurité, ceinture + bretelles).
- Aucune écriture côté `function_app.py` `ALLOWED_ORIGINS` (per-tenant + plateforme suffisent pour le widget seul).
- Curl POST depuis Origin SWA → header `Access-Control-Allow-Origin` reflété ✅. Anaïs répond.

**Réserve qualité voix Anaïs (attendue)** :
- Tant que la branche events dans `function_app.py` n'est pas faite, **rendu chat encore restaurant-teinté** : Jean-Luc / CHF / menu-du-jour peuvent fuiter (le défaut est restaurant, pas neutre — confirmé par le CC bonjour). Le knowledge socle prend le dessus à la marge, mais la voix complète arrive avec la fenêtre coordonnée.

**Conventions docs actées (croisé avec CC bonjour.sophyia)** :
- `sites/<client>/docs/` → tout ce qui est lié à UN client précis (chantier, knowledge, welcomes, briefs).
- `api/docs/` → tout ce qui touche la plateforme (`function_app.py`, markers, rag_lite, refonte rubriques admin, briefs cross-clients).
- À noter : `BRIEF-CODEX-2-branche-events-anais.md` + `SPEC-PROMPT-anais-events.md` (rédigés par CC bonjour) iront dans `sites/dinedit-site/docs/` puisque la branche events est introduite POUR Dinédit (même si le code vit dans `api/`).

**Prochaines étapes** :
1. **DNS `dinedit.be`** — audit zone actuelle (registrar à identifier), CNAME `www` vers SWA, redirection 301 apex vers www. Pattern Villa.
2. **Fenêtre `function_app.py`** (coordonnée avec CC bonjour) — branche events + câblage `live_search` pour `type=="events"`. À déclencher quand Raoul donne le créneau.
3. **Phase 2** côté site : `events_engine.py` + `agenda_data.json` (généré au build) + `<Agenda />` inline sur la home (équivalent du `<Blog />` Villa).

### 2026-07-01 — Phase 4 UI + fenêtre backend `function_app.py` LIVRÉE ✅

**Côté site (repo `Sophyia-ai/dinedit-site`, commit `524baa9`) :**
- **Widget master** : opt-in `data-open-duration-ms` (défaut 300 = La Gare INCHANGÉ). Villa + Dinédit à 2000ms. **Fix animation d'ouverture** (le browser ne sait pas transitionner FROM `display:none` → séquence `display:flex + opacity:0` d'abord, puis double `requestAnimationFrame`, puis `.open`). Fix backward-compatible — bénéficie à La Gare aussi.
- **`src/lib/anaisIntent.ts`** : helpers `openAnaisWithEvent` + `openAnaisWithArchitectes` qui appellent `SophyiaChat.openWith(message)` avec message d'amorce **contextuel enrichi** (event : titre + date + excerpt localisés ; architectes : intention BtoC/BtoB + demande de qualification). Fallback poll si widget pas encore prêt.
- **Scenes hero** : bouton "Voir l'événement" → ouvre Anaïs avec le contexte de l'event actif du carousel. Le bouton "Agenda" secondaire navigue toujours vers `/agenda`.
- **Home bloc BtoB** : bouton "Rencontrer les Architectes" → ouvre Anaïs avec l'intention (présente concept + qualifie + propose contact Serge/Fany).
- **Renommage** Agenda → « Agenda & réservation » (3 langues, nav + page + composants).
- **AgendaInline v3** : layout aligné sur page `/agenda` (fond blanc, chips upcoming/past/all discrets, grille 3 cards). Le bloc featured XL fond nuit précédent est retiré.
- **Bulle Anaïs Dinédit** : CSS local injecté (opacity 92% + backdrop-blur 2px, retour 100% au hover). N'affecte QUE Dinédit — autres clients ne chargent pas ce stylesheet.

**Côté backend (repo `Sophyia-ai/sophyia-chat-api`, commits `21639d2` + `a070d10`) :**
- `_build_events_system_prompt(config)` implémenté aligné sur `SPEC-PROMPT-anais-events.md`. Miroir structurel de `_build_villa_system_prompt` sans aucun ADN restaurant.
- `build_system_prompt` : ajout branche `elif type=="events"` avant restaurant. Restaurant intact.
- `NAV_SECTION_META_EVENTS` : **5 rubriques finales** (agenda, architectes, sur-mesure, lieux-insolites, bon-cadeau — le bon-cadeau ajouté après retour CC bonjour : levier BtoC fort acté dès Phase 0). 3 langues portants FR/EN/NL, fallbacks anglais pour de/it/ru/he (aucune casse itération multi-lang admin).
- `_init_nav_from_template` : ajout `elif events` avec 3 langues.
- **Gating tools** : `has_function_calling = is_villa or is_events`. Anaïs a **`live_search` UNIQUEMENT** (villa_tools.TOOL_DEFINITIONS filtré — météo Callas et itinéraires villa n'ont aucun sens pour un bot Bruxelles). `_proactive_web_fetch` désactivé pour events comme pour villa.

**Non-régression validée byte-per-byte (tests Python obligatoires) :**
- La Gare Cully : prompt sha `d3e0adb1fa61` INCHANGÉ.
- Villa Olive You (Olivia) : prompt sha `36a0e127eb41` INCHANGÉ.
- Anaïs (events) : prompt sha `b3dadfb232fb`, propre — zéro fuite (0 mention de CHF, Chef Jean-Luc, Lavaux, Dezaley, Chasselas, Cornalin, Gamay, menu du jour). Identity présente : Bruxelles, Serge, Fany, €, Anaïs, Dinédit.

**Reste côté CC bonjour :** ré-appeler `_init_nav_from_template("dinedit")` (snapshot avant) pour écrire les 5 nav_items propres. Après ça la nav restaurant fuitée dans le widget Dinédit disparaît et la branche events est vraiment stable.

## Répartition des rôles CC — actée 2026-07-01

**CC bonjour (`bonjour.sophyia.io`)** = **la plateforme d'onboarding et d'admin**. Panel admin, rubriques dynamiques, workflows de catapultage rapide (site+chatbot ou juste chatbot pour un nouveau client), briefs de spec des branches métier, templates de bots. Backend transversal.

**CC site (moi, Dinédit ici — mais aussi Villa Olive You, La Gare Cully, futurs)** = **les sites clients**. Contenu, UI/UX, moteurs de contenu (blog / events / gallery), SEO, DNS, intégration widget côté site. Je touche `function_app.py` **uniquement** pour les fonctions spécifiques à un client précis (comme la branche `events` pour Anaïs, la branche `villa` pour Olivia) et **toujours en coordination** avec CC bonjour.

**Zone commune** = `function_app.py`. Fenêtres coordonnées obligatoires. Snapshots + tests byte-per-byte + verrous verbaux avant d'y toucher.

**Sync** = doc partagé `sites/<client>/docs/<CLIENT>-PLAN.md` (journaux CC bonjour + CC site côte-à-côte, comme ce fichier).

**Ce que Raoul attend de cette répartition** : *« il faut vraiment resserrer les tafs »* — chacun sur son territoire pour aller vite, coordination explicite quand on croise. Pas de dispersion.

---

## Session soirée 2026-07-01 → nuit 2026-07-02 — mise en ligne dinedit.events (CC site)

**Contexte du jour :** Raoul a acheté `dinedit.events` chez OVH en cours de journée. Le domaine legacy `dinedit.be` héberge encore le WordPress de Serge — la nouvelle version React vit sur `.events` en environnement invisible (Serge n'est pas au courant). Photos et textes attendus le 2026-07-02+.

### Livraisons de la session

**1) Corrections UX (double hero + Anaïs prend la relève partout)**
- `VideoHero.tsx` créé : vidéo plein écran autoplay/muet/loop (`public/video/homepage_hero.mp4`) au-dessus de `Scenes.tsx`. Chevron scroll doux vers `#scenes-hero`.
- `Scenes.tsx` : retrait du `LanguagePill` (reste sur VideoHero uniquement), bouton hero renommé « Parle-moi de l'événement » (FR/EN/NL), bouton secondaire → ancre `#agenda`.
- Nav « Agenda & réservation » = ancre `#agenda` (smooth scroll cross-page depuis `/architectes`), Nav « Les Architectes » ouvre Anaïs (`openAnaisWithArchitectes`).
- Footer : `/architectes` conservé mais label = « Sources / Bronnen » (fallback SEO / crash LLM, même logique que Villa `/journal` → « Carnet d'Olivia »).
- Page event statique : header « ← Agenda » et breadcrumb pointent sur `/#agenda` pour retour rapide au bloc blog.
- CTA hero « Voir l'événement » → « Parle-moi de l'événement » car le bouton ouvre le chat, pas la page event.

**2) Pages légales BE — RGPD (UE) 2016/679 + loi belge 30/07/2018**
- 3 fichiers `src/locales/{fr,en,nl}/legal.json` créés (mentions légales, confidentialité, CGU).
- Namespace `legal` enregistré dans `i18n.ts` (5 namespaces total).
- Éditeur : Serge Vanmol seul, indépendant personne physique (Fany volontairement absente pour protéger Serge côté déclaratif).
- Section `SECTIONS.privacy` renommée `olivia` → `anais` dans `Legal.tsx`.
- Bouton CGU ajouté dans le footer (absent avant).
- Hébergement chatbot **Azure Switzerland North (Zurich)** mentionné, **jamais** le nom d'un LLM.
- Placeholders restants à remplir par Raoul : `[adresse complète]` + `[BE 0XXX.XXX.XXX]`.

**3) Constellation Dinédit — moteur « Nos recommandations »**
- `automation/recommendations_engine.py` (moteur complet, calqué sur `blog_engine.py` de Villa mais adapté HTML scraping + 3 langues).
- `automation/reco_sources.json` : 10 sources (7 offices du tourisme belges + 3 portails Wallonie/Flandre/national). 8 actives, 2 désactivées via `disabled: true` (visitantwerpen.be SPA JS-rendered, out.be timeout).
- `automation/template_reco.html` : palette Dinédit + bloc « constellation » CTA `/#agenda` + home en pied d'article.
- **Garde-fous constellation Dinédit vérifiés programmatiquement** (`_verify_constellation`) : au moins 2 occurrences de « Dinédit » + lien `/#agenda` + lien home + trigger `[Anaïs](anais:...)`. 1 retry avec rappel explicite si un check rate, sinon rejet.
- `.github/workflows/recommendations.yml` : cron lun+jeu 06:30 UTC (2×/semaine) + burst manuel via `workflow_dispatch` + purge mensuelle des recos passées (>30 j).
- `AgendaInline.tsx` : 4e chip « Nos recommandations » qui fetch `/reco_data.json` + rendu 3-col cards. `useRef` + `useEffect` sur `filter === 'reco'` → `scrollIntoView` smooth vers `#recos-block` (car le bloc est sous les 3 cards upcoming, hors du viewport initial).
- **Résultat des runs** : run 1 a produit 6 recos mais le push a échoué (gitignore trop agressif) ; run 2 après fixes = 9 recos publiées, sitemap 45 URLs, push OK. Bruxelles 1 + Bruges 3 + Liège 2 + Mons 3.

**4) Basculement domaine → dinedit.events (production)**
- DNS OVH : CNAME `www` → `kind-smoke-0fbf0a803.7.azurestaticapps.net` + A apex → `9.163.40.246` (IP Azure SWA West Europe).
- Redirection 301 apex → www **supprimée** après bascule A record (Azure force auto le HTTPS + gère l'apex directement).
- Azure SWA `dinedit-site` : `www.dinedit.events` + `dinedit.events` en Ready avec SSL auto.
- Google Search Console + Bing validés (TXT `google-site-verification` posé par Raoul, sitemap soumis).
- `BASE_URL` swap `dinedit.be` → `dinedit.events` partout : `automation/{events,recommendations}_engine.py`, `src/config/site.ts`, `public/{robots,llms}.txt`, `src/locales/{fr,en,nl}/legal.json`, `public/recommendations/**.html` (27 fichiers du run reco antérieur), `public/reco_data.json`, `public/sitemap.xml`, `index.html` (canonical).
- Emails `anais@dinedit.be` **volontairement conservés sur `.be`** (déjà annoncé à Serge, cadre Belgique).
- Régénération complète events × 3 langues (9 HTML) + sitemap.xml (45 URLs total).

**5) Anaïs — fix CORS multi-couches + anti-rabâchage prompt**
- **CORS** : ajout de `https://dinedit.events`, `https://www.dinedit.events`, `https://kind-smoke-0fbf0a803.7.azurestaticapps.net` dans `ALLOWED_ORIGINS` (`function_app.py`) **et** dans la plateforme Azure Function App (`az functionapp cors add`). Non-régression byte-per-byte prouvée : villa/events SHA inchangés.
- **Prompt anti-rabâchage v1** : nouveau rail 5 « MÉMOIRE DE CONVERSATION » + section FONDATEURS renforcée (« une seule présentation », puis « la maison / on / ils »). Villa SHA `5ef9171b061640e0` inchangé.
- **Prompt anti-rabâchage v2 (correction)** : Anaïs continuait à redemander des infos déjà données (« tu as le nombre de convive patate ! Je t'ai dit 30 personnes »). RAPPEL FINAL restructuré avec MÉMOIRE DE CONVERSATION en tête (relire l'échange, ne redemande jamais une info déjà donnée, « je transmets » = une fois, alternance Serge/Fany/la maison/ils/on). Villa SHA inchangé.

### Bilan smoke test final (2026-07-02 00:19 UTC)

- Apex HTTPS `https://dinedit.events/` : 200 (Azure SSL) ✅
- www HTTPS : 200 ✅
- Apex HTTP → 301 HTTPS (Azure enforce) ✅
- Sitemap 45 URLs multilingues ✅
- Canonical index → `https://www.dinedit.events/` ✅
- 9 recos + 3 events upcoming ✅
- CORS chat OK ✅
- Pages event/reco statiques + llms.txt + vidéo hero : 200 ✅

### Leçons apprises — à ne pas reproduire

**L1. `.gitignore` trop agressif sur les artefacts CI.**
- **Bug** : run 1 du moteur reco a produit les HTML sur le runner GHA mais le `git add public/recommendations public/reco_data.json public/sitemap.xml` a échoué car ces chemins étaient dans `.gitignore`. `git add` refuse les fichiers ignorés sans `-f`.
- **Fix** : retirer du `.gitignore` tout ce qui est généré par un workflow LLM (non-reproductible au build). Villa n'a **rien** dans `.gitignore` sur `public/` — c'est le bon pattern.
- **Règle** : ne gitignore que ce qui est régénéré à chaque build Azure SWA (events, gallery). Ce que le GHA cron produit (recos) ou ce qui contient un agrégat cross-source (sitemap) **doit être tracké**.

**L2. Sitemap partagé entre 2 moteurs — coordination.**
- **Bug potentiel** : `events_engine.py` (prebuild Azure) régénère le sitemap avec events seuls. Il écrasait la version enrichie recos.
- **Fix** : `events_engine.py` merge désormais `reco_data.json` (si présent) dans son sitemap. Un seul sitemap canonique, généré au dernier build.
- **Règle** : quand 2 pipelines écrivent le même artefact, celui qui court en dernier (Azure prebuild) doit connaître les autres via leurs index JSON.

**L3. Sources tourisme belge : la moitié rend zéro candidat en HTML statique.**
- **Bug** : visitgent.be, namurtourisme.be (racine), visitwallonia.be, coeurdeflandre.fr, visitantwerpen.be, out.be = 0 candidats ou fetch KO.
- **Cause** : sites SPA rendus côté JS (Anvers, Gand, une partie de Wallonia) → HTML statique quasi vide. Ou pages listing sans balisage exploitable.
- **Fix appliqué** : Anvers + out.be désactivés via `disabled: true`. Namur → URL `/fr/agenda` spécifique. Les 4 autres restent branchés mais rendent 0-1 candidat sporadiquement.
- **À prévoir** : rendu headless (Playwright) pour Anvers + Gand, ou API sitemap.xml des offices pour extraire les URLs d'events sans dépendre du HTML de la home.

**L4. Distribution burst pondérée peut donner 0 à une source active.**
- **Bug** : run 1 avec `--initial-burst 20` a réparti aléatoirement les quotas via `random.shuffle` sur les priorités → Namur reçoit 0 comme quota alors qu'elle est active.
- **Fix** : garantir min 1 quota par source active avant distribution proportionnelle du reste. Fix appliqué dans `recommendations_engine.py` main().
- **Règle** : quand on répartit un budget sur N sources actives, toujours **plancher = 1 par source**, distribuer le surplus en pondéré.

**L5. Constellation Dinédit sans vérif programmatique = article qui fuit sans marque.**
- **Risque** : le LLM peut oublier de mettre les liens Dinédit ou les mentionner qu'une fois → l'article vaut moins comme boost SEO.
- **Fix** : `_verify_constellation()` compte les occurrences « Dinédit » (≥2), la présence de `/#agenda`, du lien home, du trigger `anais:`. Si un check rate, 1 retry avec rappel explicite au LLM, sinon rejet propre.
- **Règle** : quand un article est censé porter des règles SEO cross-brand, valider programmatiquement avant publication. Ne jamais faire confiance au LLM pour respecter une consigne « obligatoire ».

**L6. Nouveau domaine = double couche CORS à mettre à jour (piège récurrent).**
- **Contexte** : quand Olivia est passée sur `villaoliveyou.com` (2026-06-29), CORS 403 « Origin not allowed » car seule la couche Python `ALLOWED_ORIGINS` avait été mise à jour ; la couche plateforme Azure Function App bloquait le preflight OPTIONS avant même d'atteindre le code Python.
- **Rejeu 2026-07-01 sur Dinédit** : Anaïs n'apparaît pas sur `www.dinedit.events`. Même diagnostic.
- **Règle en dur** : à chaque nouveau custom domain d'un client, mettre à jour **les 2 couches** :
  1. `function_app.py` `ALLOWED_ORIGINS` (Python)
  2. Azure Function App CORS platform : `az functionapp cors add --name sophyia-chat-api --resource-group Sophyia-chat --allowed-origins "https://<domaine>" "https://www.<domaine>"`
- Ajouter aussi le hostname SWA brut (`<hash>.azurestaticapps.net`) pour le debug pré-DNS.

**L7. Perl look-behind pour swap dinedit.be → dinedit.events sans casser les emails.**
- **Bug évité** : un `sed 's/dinedit.be/dinedit.events/g'` casserait `anais@dinedit.be` (email conservé sur `.be`).
- **Solution** : `perl -pi -e 's/(?<!\@)dinedit\.be/dinedit.events/g'` — le `(?<!\@)` refuse le match si `@` juste avant. Sed BSD ne supporte pas look-behind, il faut Perl.
- **Règle** : pour tout swap partiel de domaine avec préservation des emails, utiliser Perl look-behind. Toujours faire un `grep -rn "old" src/ automation/ public/ | grep -v "@old"` après pour vérifier.

**L8. OVH web redirection = HTTP-only + oubli fréquent.**
- **Contexte** : OVH « Redirection » côté panneau crée un A record vers l'IP de leur serveur redirect (openresty) qui ne fait le 301 qu'en HTTP. HTTPS apex → erreur SSL.
- **Solution propre** : ajouter l'apex comme custom domain sur Azure SWA (validation TXT), puis basculer l'A record OVH vers l'IP Azure SWA. Azure sert HTTPS sur l'apex + redirige HTTP → HTTPS automatiquement.
- **Ordre à respecter** : (1) modifier A record, (2) attendre propagation Google DNS + Cloudflare, (3) supprimer la redirection 301 OVH. Si étape 3 avant étape 1 : apex tombe sur parking OVH pendant l'intervalle.

**L9. Canonical HTML = seule protection contre duplicate content quand Azure sert apex ET www.**
- **Contexte** : Azure SWA sert le même contenu sur `dinedit.events` ET `www.dinedit.events`, sans redirect natif entre les 2. Google verrait ça comme du duplicate content sauf si le HTML dit lequel est canonique.
- **Fix** : `<link rel="canonical" href="https://www.dinedit.events/">` dans `index.html`. Perl sed a oublié `index.html` la 1ère passe → oubli critique attrapé au dernier moment.
- **Règle** : quand on swap BASE_URL, la checklist des fichiers doit inclure `index.html` explicitement. Toujours faire un `grep -rn "olddomain" .` de sanity check final incluant la racine, pas seulement `src/`.

**L10. Prompt anti-rabâchage : le RAPPEL FINAL prime sur les rails du milieu.**
- **Contexte** : v1 du fix anti-rabâchage a été ajouté au milieu du prompt (rail 5) mais Anaïs a juste échangé « Serge et Fany » contre « la maison » et a re-demandé des infos déjà données.
- **Fix v2** : nouvelle structure du RAPPEL FINAL (fin du prompt = ce que le LLM relit juste avant de répondre → plus d'ancrage) avec :
  * MÉMOIRE DE CONVERSATION en tête : « relis l'échange, ne redemande jamais une info déjà donnée »
  * Traitement symétrique de « Serge et Fany » ET « la maison » (une fois puis on varie ou on omet)
  * « Je transmets » = une fois seulement
- **Règle** : les règles de mémoire de conversation et d'anti-répétition doivent vivre dans le RAPPEL FINAL, pas au milieu. Un rail au milieu s'oublie ; un rappel en fin de prompt s'applique.

**L11. Byte-per-byte test = protocole obligatoire à chaque touche `function_app.py`.**
- **Contexte** : `function_app.py` est zone commune avec CC bonjour. Toute touche doit prouver que les prompts La Gare + Villa restent identiques.
- **Méthode utilisée cette session** :
  1. AVANT edit : `hashlib.sha256` sur le code des fonctions `_build_villa_system_prompt` et `_build_events_system_prompt` (extraction regex du bloc `def` complet).
  2. APRÈS edit : recomputer les SHA. Villa doit rester identique, events peut changer si c'est l'events qu'on modifie.
  3. Toujours `python3 -c "import ast; ast.parse(open('function_app.py').read()); print('AST OK')"` pour valider la syntaxe avant push.
- **Règle** : sans cette preuve, ne pas push. Le message de commit doit contenir les SHA avant/après pour audit CC bonjour.

### État du chantier au 2026-07-02 00:19 UTC

- **Site en ligne** : https://www.dinedit.events (SSL Azure, apex + www propres)
- **Anaïs** : chatbot déployé, CORS OK, prompt v2 en cours de test par Raoul
- **Recos** : 9 publiées, cron 2×/semaine armé, purge mensuelle
- **Legal BE** : 3 documents × 3 langues, RGPD UE + loi belge conforme
- **SEO** : sitemap 45 URLs, canonical propre, GSC + Bing validés
- **Attente Serge** : photos (ambiances, portraits, événements) + textes définitifs (agenda, bio, mentions BCE/TVA) → 2026-07-02+

### Reste à venir (prochaine session)

- Intégrer les photos/textes de Serge quand ils arrivent.
- Réactiver visitantwerpen.be (rendu headless Playwright dans le workflow reco) et out.be (URL alternative avec timeout élargi).
- Vérifier Anaïs post prompt v2 → si toujours du rabâchage, itérer une v3.
- Basculement final du domaine `.be` → `.events` (si Raoul valide avec Serge et si Serge veut abandonner le WordPress legacy).
