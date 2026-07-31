// ─────────────────────────────────────────────────────────────────────────────
// /api/stripe/webhook — mini-CRM Dinédit (Option B : Google Sheets).
//
// Reçoit les événements Stripe, VÉRIFIE la signature, et écrit une ligne dans
// l'onglet Leads d'une Google Sheet. Idempotent (dédup stricte sur
// stripe_session_id). Aucune donnée sensible loggée en clair. 2xx uniquement si
// l'event est géré ou déjà traité ; erreur → 5xx pour que Stripe réessaie.
//
// Env (config Azure SWA — jamais côté front) :
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//   GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY,
//   GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_TAB_NAME (défaut "Leads")
// ─────────────────────────────────────────────────────────────────────────────

const Stripe = require('stripe')
const { google } = require('googleapis')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_missing')
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const TAB = process.env.GOOGLE_SHEETS_TAB_NAME || 'Leads'

// Ordre EXACT des colonnes de l'onglet Leads (ligne 1) :
// created_at | source | type | event_slug | full_name | email | phone |
// stripe_session_id | stripe_customer_id | payment_intent_id | amount_eur |
// currency | payment_status | notes
// → stripe_session_id = colonne H (8e) pour la dédup.

function sheetsClient() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    null,
    (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets'],
  )
  return google.sheets({ version: 'v4', auth })
}

module.exports = async function (context, req) {
  // 1) Vérification de signature AVANT tout parsing métier.
  const sig = req.headers['stripe-signature']
  const raw = req.rawBody // payload brut requis par Stripe
  let event
  try {
    if (!WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET manquant')
    event = stripe.webhooks.constructEvent(raw, sig, WEBHOOK_SECRET)
  } catch (err) {
    context.log.warn('Webhook: signature invalide ou secret manquant')
    context.res = { status: 400, body: 'Invalid signature' }
    return
  }

  // 2) On ne traite que la fin de paiement Checkout ; le reste → 2xx (ignoré).
  if (event.type !== 'checkout.session.completed') {
    context.res = { status: 200, body: 'ignored' }
    return
  }

  const s = event.data.object || {}
  const sessionId = s.id || ''

  try {
    const sheets = sheetsClient()

    // 3) Dédup stricte : si le session_id est déjà présent → no-op 200.
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB}!H:H`,
      majorDimension: 'COLUMNS',
    })
    const seen = (existing.data.values && existing.data.values[0]) || []
    if (sessionId && seen.includes(sessionId)) {
      context.log.info('Webhook: session déjà enregistrée, no-op')
      context.res = { status: 200, body: 'already processed' }
      return
    }

    // 4) Construction de la ligne (mapping colonnes A→N).
    const cd = s.customer_details || {}
    const meta = s.metadata || {}
    const row = [
      new Date().toISOString(),                                  // created_at (ISO UTC)
      'stripe_webhook',                                          // source
      meta.type || (meta.kind === 'membership' ? 'membre' : 'B2C_diner'), // type
      meta.event_slug || '',                                     // event_slug
      cd.name || '',                                             // full_name
      cd.email || '',                                            // email
      cd.phone || '',                                            // phone
      sessionId,                                                 // stripe_session_id
      s.customer || '',                                          // stripe_customer_id
      s.payment_intent || '',                                    // payment_intent_id
      s.amount_total != null ? s.amount_total / 100 : '',        // amount_eur
      (s.currency || '').toUpperCase(),                          // currency
      s.payment_status || '',                                    // payment_status
      '',                                                        // notes
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB}!A:N`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    })

    context.log.info('Webhook: lead enregistré')
    context.res = { status: 200, body: 'ok' }
  } catch (err) {
    // Erreur d'écriture CRM → 5xx pour que Stripe réessaie (retry natif).
    context.log.error('Webhook: échec écriture CRM —', err && err.message)
    context.res = { status: 500, body: 'CRM write failed' }
  }
}
