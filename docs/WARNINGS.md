# WARNINGS — dinedit-site (landmines à ne pas refaire)

## Stripe checkout : prix lu CÔTÉ SERVEUR, jamais depuis le client
`api/checkout` lit `price_btoc_eur` depuis `agenda_data.json` (serveur). NE JAMAIS accepter un prix
envoyé par le navigateur (anti-triche). Prix absent → retombe sur /contact.

## Webhook Stripe : signature OBLIGATOIRE avant tout parsing
`api/stripe-webhook` vérifie `Stripe-Signature` (`STRIPE_WEBHOOK_SECRET`) avant de traiter — sinon
n'importe qui pourrait écrire de fausses lignes. NB : `get_public_settings`/`generate_welcome` sont
sur **`/api/auth/admin`**, PAS `/api/chat` (tester le mauvais endpoint renvoie un `{}` trompeur).

## Google Sheet CRM : l'onglet DOIT s'appeler « Leads »
La Sheet avait l'onglet par défaut « Feuille 1 » → écritures en 500 « CRM write failed »
(« Unable to parse range: Leads!… »). Renommé en Leads. `GOOGLE_SHEETS_TAB_NAME=Leads`. Header
14 colonnes en ligne 1, `stripe_session_id` en **colonne H** (clé de dédup).

## Secrets : jamais dans local.settings.json ni dans le front
`api/local.settings.json` `AZURE_OPENAI_API_KEY` = placeholder `YOUR_KEY_HERE`. Les vraies clés
(Stripe, Google, OpenAI) sont dans les **app settings Azure** (SWA `dinedit-site` / function app
`sophyia-chat-api`). Jamais dans le bundle front (vérifié : 0 occurrence).

## Adhésion membre : pas d'espace membre auto
Le −15 % passe par le **code promo Stripe `MEMBRE15`** (partagé) saisi par le membre au checkout ;
pas d'application automatique (pas de login). Avantages livrés manuellement via le CRM. Espace
membre auto (login + galerie) = projet ultérieur.

## Webhooks WooCommerce obsolètes (legacy)
Anciens webhooks WooCommerce nettoyés (dinedit.be supprimé, linen-hippopotamus…tingersite.com
désactivé). L'ancien WooCommerce tourne peut-être encore sur son hébergement — à éteindre un jour.

## SWA managed functions : dossier api/ + api_location "api" dans le workflow GHA
Sans package-lock.json committé, le build CI casse (bug npm optional-deps rollup sur Node 22).
