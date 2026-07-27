# Politique de sécurisation par défaut — Sites / Apps / Bot-Chat

## 1) Objectif
Cette politique définit le **socle sécurité obligatoire** pour tout nouveau site/app/bot-chat, ainsi que la procédure de mise à jour continue.

Principe directeur : **secure-by-default**.
- Tout nouveau projet embarque ces contrôles via templates précodés.
- Tout projet existant doit être remis en conformité.
- La politique est revue à chaque consultation et peut être enrichie.

## 2) Périmètre
S’applique à :
- Front web (site vitrine, admin, widget, app client).
- Backend/API (auth, routes admin, stockage, webhooks).
- Bot-chat (prompts système, actions, outils, données tenant).
- Infra et configuration (secrets, domaines, déploiement, accès).

## 3) Règles obligatoires (baseline)

### A. Identité, Auth, Session
1. Auth centralisée et vérification stricte des tokens (signature, `iss`, `aud`, `exp`, claims critiques).
2. Sessions en cookie `HttpOnly; Secure; SameSite` adapté au flux.
3. Durée de session bornée + rotation sur login/re-login.
4. Refus explicite des comptes non provisionnés (pas d’auto-création implicite).
5. Séparation des rôles (admin / client / bot), contrôlée côté backend (jamais uniquement front).

### B. Autorisation & isolation multi-tenant
6. Clé d’identité fonctionnelle = `bot_id` / `tenant_id` (pas email comme clé métier).
7. Toute action mutante doit cibler un identifiant unique non ambigu.
8. Isolation stricte des données par tenant (lecture/écriture, fichiers, assets, prompts, logs).
9. Impersonation admin journalisée et bornée (garde-fous + format d’ID validé).

### C. API, CSRF, CORS
10. CORS en allowlist stricte (pas de wildcard en prod).
11. Protection CSRF obligatoire pour endpoints mutantes avec cookie (`Origin/Referer` + token CSRF).
12. Validation stricte des entrées (JSON, types, longueur, charset, identifiants).
13. Messages d’erreur non bavards en production (pas de fuite d’implémentation).

### D. Données, secrets, stockage
14. Secrets uniquement via variables d’environnement/secret manager (jamais dans repo).
15. Chiffrement en transit (HTTPS) et au repos selon capacités plateforme.
16. Backups versionnés pour données critiques (`users.json`, settings tenant, contenus).
17. Restauration testée (rollback opérationnel documenté).

### E. Bot-chat & sécurité conversationnelle
18. Prompt système anti-injection (priorité des instructions et refus de fuite de secrets).
19. Outils/actions bot sous contrôle d’autorisation explicite.
20. Données personnelles minimisées (collecte nécessaire uniquement, pas de surplus).
21. Journaliser les actions sensibles bot (qui, quoi, quand, tenant).

### F. Résilience & observabilité
22. Rate limit sur login et endpoints sensibles.
23. Logs sécurité centralisés (auth refusée, accès interdit, actions admin critiques).
24. Alertes minimales : pics d’échec login, erreurs JWT, actions admin anormales.
25. Feature flags pour migrations sensibles (expand/contract) afin d’éviter les ruptures.

## 4) Exigence template (nouveaux projets)
Chaque template doit embarquer par défaut :
- Middleware auth + vérif token stricte.
- Guard rôle/tenant.
- Paramètres CORS/CSRF sécurisés.
- Gestion cookie/session standardisée.
- Checklists de sécurité et scripts de vérification.
- Fichier de configuration des origins autorisées non vide.

## 5) Mise à niveau des projets existants
Pour chaque site/app/bot-chat existant :
1. Audit de conformité baseline.
2. Plan de rattrapage priorisé (`P0` critique, `P1` élevé, `P2` normal).
3. Correctifs via branche dédiée + backup préalable.
4. Vérification fonctionnelle (non-régression) + sécurité.
5. Validation et traçabilité dans le registre de conformité.

## 6) Registre de conformité (checklist obligatoire)
Chaque projet maintient une checklist avec statut :
- `OK` (conforme), `PARTIAL`, `KO`, `N/A`.
- Date de vérification.
- Responsable.
- Preuve (commit, screenshot, log, test).

Exemple minimal de clés de contrôle :
- `SEC-AUTH-001` Vérification JWT stricte.
- `SEC-AUTH-002` Cookie session conforme.
- `SEC-AUTH-003` Rôles backend effectifs.
- `SEC-TENANT-001` Isolation tenant validée.
- `SEC-API-001` CSRF protégé.
- `SEC-API-002` CORS allowlist stricte.
- `SEC-SECRET-001` Aucun secret en dur.
- `SEC-BACKUP-001` Backup + rollback testés.
- `SEC-BOT-001` Protection prompt-injection active.

## 7) Gouvernance des mises à jour (politique vivante)
La politique est évolutive. Toute consultation sécurité peut produire une mise à jour.

### 7.1 Déclencheurs de mise à jour
- Incident sécurité ou quasi-incident.
- Nouveau vecteur d’attaque identifié.
- Changement d’architecture (auth, stockage, multi-tenant, providers).
- Recommandation issue d’un audit externe/interne.

### 7.2 Versioning
- Format : `MAJOR.MINOR.PATCH`.
- `MAJOR` : rupture de compatibilité / nouvelle obligation structurante.
- `MINOR` : nouveaux contrôles obligatoires sans rupture.
- `PATCH` : clarifications, wording, preuves.

### 7.3 Cycle de révision
- Revue rapide : à chaque consultation sécurité.
- Revue complète : mensuelle (ou à défaut trimestrielle).
- Publication d’un changelog de politique avec impacts attendus.

## 8) Règles de déploiement des changements sécurité
1. **Backup d’abord** (code + données).
2. Déploiement progressif (feature flag/canary si possible).
3. Tests de non-régression (auth/login, actions admin, chat).
4. Validation post-déploiement (logs/alertes).
5. Plan de rollback prêt et testé.

## 9) Niveaux de sévérité et SLA de correction
- `P0` critique : correction immédiate / hotfix.
- `P1` élevé : correction prioritaire (sprint en cours).
- `P2` normal : planifié.
- `P3` amélioration : backlog.

## 10) Clause d’application
Cette politique est **obligatoire** pour tout nouveau site/app/bot-chat et pour toute évolution majeure des systèmes existants.

Tout écart doit être :
1. documenté,
2. justifié,
3. approuvé,
4. assorti d’une date de remédiation.

---

## 11) Tableau exécutable de conformité (à utiliser tel quel)

Utilisation :
- Une ligne = un contrôle.
- `Statut` ∈ `OK` / `PARTIAL` / `KO` / `N/A`.
- `Preuve` = lien commit, screenshot, log, test, ticket.
- `Owner` = personne responsable.
- `Deadline` obligatoire si `PARTIAL`/`KO`.

| Contrôle | Description | Statut | Preuve | Owner | Deadline | Dernière vérif |
|---|---|---|---|---|---|---|
| `SEC-AUTH-001` | Vérification JWT stricte (`iss`, `aud`, `exp`, signature, alg) | `KO` |  |  |  |  |
| `SEC-AUTH-002` | Cookie session conforme (`HttpOnly`, `Secure`, `SameSite`) | `KO` |  |  |  |  |
| `SEC-AUTH-003` | Contrôles de rôle côté backend (admin/client/bot) | `KO` |  |  |  |  |
| `SEC-AUTH-004` | Refus des comptes non provisionnés (pas d’auto-provision implicite) | `KO` |  |  |  |  |
| `SEC-TENANT-001` | Isolation multi-tenant vérifiée (`bot_id`/`tenant_id`) | `KO` |  |  |  |  |
| `SEC-TENANT-002` | Actions mutantes ciblent un identifiant unique non ambigu | `KO` |  |  |  |  |
| `SEC-API-001` | CSRF protégé sur endpoints mutantes (cookie + origin/token) | `KO` |  |  |  |  |
| `SEC-API-002` | CORS allowlist stricte (pas de wildcard prod) | `KO` |  |  |  |  |
| `SEC-API-003` | Validation stricte des entrées (types, tailles, formats) | `KO` |  |  |  |  |
| `SEC-API-004` | Messages d’erreur non bavards en prod | `KO` |  |  |  |  |
| `SEC-RATE-001` | Rate-limit actif login + endpoints sensibles | `KO` |  |  |  |  |
| `SEC-SECRET-001` | Aucun secret en dur dans le repo | `KO` |  |  |  |  |
| `SEC-SECRET-002` | Secrets en env/secret manager uniquement | `KO` |  |  |  |  |
| `SEC-BACKUP-001` | Backup des données critiques versionné | `KO` |  |  |  |  |
| `SEC-BACKUP-002` | Procédure rollback documentée + testée | `KO` |  |  |  |  |
| `SEC-LOG-001` | Logs sécurité (auth refusée, accès interdit, actions critiques) | `KO` |  |  |  |  |
| `SEC-ALERT-001` | Alertes minimales sécurité en place | `KO` |  |  |  |  |
| `SEC-BOT-001` | Protection prompt-injection active | `KO` |  |  |  |  |
| `SEC-BOT-002` | Outils bot sous contrôle d’autorisation explicite | `KO` |  |  |  |  |
| `SEC-PRIV-001` | Minimisation des données personnelles collectées | `KO` |  |  |  |  |

### 11.1 Score de conformité (optionnel mais recommandé)
- Score = `OK / (OK + PARTIAL + KO)`.
- Seuil de mise en production recommandé :
  - `P0` : aucun `KO` toléré.
  - `P1` : max 2 `PARTIAL` avec deadline < 30 jours.

### 11.2 Cadence d’utilisation
- Nouveau projet : tableau rempli **avant** go-live.
- Projet existant : revue mensuelle, et revue immédiate après incident/changement majeur.

---

## Annexe — Procédure d’usage rapide
1. Créer projet depuis template sécurisé.
2. Exécuter checklist `SEC-*`.
3. Corriger les `KO`/`PARTIAL` avant mise en production.
4. Enregistrer la preuve de conformité.
5. À chaque consultation : réévaluer la politique et publier les mises à jour.
