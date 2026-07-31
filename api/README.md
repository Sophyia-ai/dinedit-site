# api/ — fonctions managées Azure SWA (Dinédit)

Deux endpoints, servis par le Static Web App `dinedit-site` sous `/api/*`.

| Endpoint | Rôle |
|---|---|
| `GET /api/checkout?event=<slug>` / `?type=membre` | Crée une Stripe Checkout Session à la volée (prix lu côté serveur). |
| `POST /api/stripe/webhook` | Reçoit les events Stripe, **vérifie la signature**, écrit un lead dans une **Google Sheet** (mini-CRM). Idempotent. |

## Variables d'environnement (config Azure SWA → Environment variables — jamais côté front)

| Variable | Rôle |
|---|---|
| `STRIPE_SECRET_KEY` | Clé Stripe (test `sk_test_…` ou restreinte live `rk_live_…`). |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du webhook (`whsec_…`), donné par Stripe à la création de l'endpoint. |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Email du service account Google. |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Clé privée du service account (les `\n` sont convertis automatiquement). |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ID de la Google Sheet (dans son URL). |
| `GOOGLE_SHEETS_TAB_NAME` | Onglet cible (défaut `Leads`). |
| `SITE_URL` | `https://www.dinedit.events` (utilisé par checkout). |

Le service account doit être **partagé en Éditeur** sur la Sheet. L'onglet `Leads`
doit avoir en **ligne 1** exactement :
`created_at, source, type, event_slug, full_name, email, phone, stripe_session_id, stripe_customer_id, payment_intent_id, amount_eur, currency, payment_status, notes`

## Créer le webhook côté Stripe
Dashboard Stripe → Webhooks → **Ajouter une destination** :
- URL : `https://www.dinedit.events/api/stripe/webhook`
- Événements : au minimum **`checkout.session.completed`**.
- Copier le **Signing secret** (`whsec_…`) → le poser dans `STRIPE_WEBHOOK_SECRET` (Azure).

## Tester le webhook
Avec le **Stripe CLI** (mode test) :
```bash
stripe listen --forward-to https://www.dinedit.events/api/stripe/webhook
stripe trigger checkout.session.completed
```
Attendu :
1. **1 ligne** créée dans l'onglet `Leads`.
2. **Re-trigger** du même event (même `session_id`) → **pas de doublon** (no-op 200).
3. Requête **mal signée** (mauvais secret) → **400**.
4. Aucune régression sur `/api/checkout`.

Ou depuis le Dashboard : ouvrir un event `checkout.session.completed` → **« Renvoyer »**.
