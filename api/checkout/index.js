// ─────────────────────────────────────────────────────────────────────────────
// /api/checkout — génère un paiement Stripe à la volée (aucun lien à créer à la main).
//
//   GET /api/checkout?event=<slug>   → Checkout Session pour un dîner (prix lu
//                                       côté serveur depuis agenda_data.json)
//   GET /api/checkout?type=membre    → abonnement annuel 75 €/an
//
// Sécurité : le prix n'est JAMAIS accepté depuis le navigateur — il est lu
// côté serveur d'après la donnée publiée du site. La clé secrète vit dans la
// variable d'environnement STRIPE_SECRET_KEY (config Azure SWA), jamais exposée.
// ─────────────────────────────────────────────────────────────────────────────

const Stripe = require('stripe')

const SITE_URL = (process.env.SITE_URL || 'https://www.dinedit.events').replace(/\/$/, '')
const MEMBER_PRICE_EUR = 75

function pickTitle(title) {
  if (!title) return 'Dîner inédit Dinédit'
  if (typeof title === 'string') return title
  return title.fr || Object.values(title)[0] || 'Dîner inédit Dinédit'
}

module.exports = async function (context, req) {
  const redirect = (url) => { context.res = { status: 302, headers: { Location: url } } }

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    context.log.error('STRIPE_SECRET_KEY manquante')
    context.res = { status: 500, body: 'Paiement non configuré (clé Stripe absente).' }
    return
  }
  const stripe = new Stripe(key)

  const type = String(req.query.type || '').toLowerCase()
  const eventSlug = String(req.query.event || '')

  try {
    let session

    // ── Adhésion membre : abonnement annuel ──────────────────────────────────
    if (type === 'membre' || type === 'member') {
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: MEMBER_PRICE_EUR * 100,
            recurring: { interval: 'year' },
            product_data: { name: 'Adhésion Dinédit — membre (12 mois)' },
          },
        }],
        metadata: { kind: 'membership' },
        success_url: `${SITE_URL}/devenir-membre?merci=1`,
        cancel_url: `${SITE_URL}/devenir-membre`,
      })

    // ── Dîner B2C : prix lu côté serveur d'après l'event ─────────────────────
    } else if (eventSlug) {
      const resp = await fetch(`${SITE_URL}/agenda_data.json`, { headers: { accept: 'application/json' } })
      if (!resp.ok) throw new Error(`agenda_data.json ${resp.status}`)
      const data = await resp.json()
      const all = [...(data.upcoming || []), ...(data.past || [])]
      const ev = all.find(e => e.slug === eventSlug)

      if (!ev) { context.res = { status: 404, body: 'Dîner introuvable.' }; return }

      const priceEur = Number(ev.price_btoc_eur)
      // Prix non renseigné → on n'invente pas : retour au contact (tarif sur demande).
      if (!priceEur || priceEur <= 0) { redirect(`${SITE_URL}/contact`); return }

      const title = pickTitle(ev.title)
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          quantity: 1,
          adjustable_quantity: { enabled: true, minimum: 1, maximum: 10 },
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(priceEur * 100),
            product_data: { name: title },
          },
        }],
        metadata: { kind: 'dinner', event_slug: eventSlug, date: ev.date_start || '' },
        success_url: `${SITE_URL}/agenda?merci=${encodeURIComponent(eventSlug)}`,
        cancel_url: `${SITE_URL}/agenda`,
      })

    // ── Aucun paramètre valide ───────────────────────────────────────────────
    } else {
      context.res = { status: 400, body: 'Paramètre requis : ?event=<slug> ou ?type=membre.' }
      return
    }

    redirect(session.url)
  } catch (err) {
    context.log.error('checkout error', err && err.message ? err.message : err)
    context.res = { status: 500, body: 'Erreur lors de la création du paiement.' }
  }
}
