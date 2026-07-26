// ─────────────────────────────────────────────────────────────────────────────
// site.ts — CLIENT-SPECIFIC CONFIGURATION (Dinédit)
//
// 3 langues : FR / EN / NL. Pas de RTL.
// Palette : fond blanc, primaire nuit #1B2A4A, accent or #C9A063.
// Tenant Sophyia : dinedit / Anaïs / bubble #C9A063 / type=events
// ─────────────────────────────────────────────────────────────────────────────

// ── Languages ────────────────────────────────────────────────────────────────
const languages = {
  supported: ['fr', 'en', 'nl'] as const,
  default: 'fr' as const,
}

export type Language = (typeof languages.supported)[number]

// ── Hero scenes (covers de la home — chaque scène = un visuel de l'agenda) ──
// Pour Dinédit, on n'a pas de "scènes immersives" comme une villa : on a des
// flyers d'events qui font office d'hero. À enrichir Phase 2 avec les hero
// réels (photos de soirées passées + flyers à venir).
export interface Scene {
  image_url: string
  poem: Record<Language, string>
  attribution?: string
}

const scenes: Scene[] = [
  {
    image_url: '/images/hero/placeholder-1.jpg',
    poem: {
      fr: "L'art à table,\nle temps d'un soir.",
      en: 'Art at the table,\nfor one evening only.',
      nl: 'Kunst aan tafel,\nslechts één avond lang.',
    },
    attribution: '© Dinédit',
  },
]

// ── Widget Anaïs (Sophyia tenant) ────────────────────────────────────────────
const widget = {
  botId: 'dinedit',
  color: '#C9A063', // or antique — accent palette Dinédit
  mode: 'bubble' as const,
  apiUrl: 'https://sophyia-chat-api-b6fbarcsb7chczam.switzerlandnorth-01.azurewebsites.net/api/chat',
  settingsUrl: 'https://sophyia-chat-api-b6fbarcsb7chczam.switzerlandnorth-01.azurewebsites.net/api/auth/admin',
}

// ── Brand ────────────────────────────────────────────────────────────────────
const brand = {
  name: 'Dinédit',
  wordmark: 'Dinédit',
  tagline: 'Meeting Alchemy',
  logoPath: '/images/brand/logo-dinedit.png',
  domain: 'dinedit.events',
  siteUrl: 'https://www.dinedit.events',
  email: 'info@dinedit.be',
  phone: '', // pas de téléphone public — qualification via Anaïs / form
}

// ── Agenda d'events (= blog rubrique « Événements ») ─────────────────────────
const agenda = {
  apiUrl: 'https://sophyia-chat-api-b6fbarcsb7chczam.switzerlandnorth-01.azurewebsites.net/api/blog?bot_id=dinedit',
  fallbackPath: '/agenda_data.json',
  baseUrl: 'https://www.dinedit.events/agenda',
}

// ── Participation (BtoC + BtoB) ──────────────────────────────────────────────
// btoc : Stripe Checkout dynamique (endpoint Azure Functions à brancher en Phase 3).
// btob : mail simple + hook CRM no-op (architecture prête pour Notion/HubSpot plus tard).
const participation = {
  btocCheckoutEndpoint: '/api/checkout', // /api/checkout?event=<slug>
  btobLeadEmail: 'info@dinedit.be',
  stripeMode: 'simulate' as 'simulate' | 'live', // 'simulate' au démarrage tant que credentials non récupérés
}

// ── Social / footer ──────────────────────────────────────────────────────────
const social = {
  instagram: 'https://www.instagram.com/dineditbxl', // @dineditbxl (brief V2)
  facebook: '',  // TODO Dinédit
}

// ── Export ───────────────────────────────────────────────────────────────────
export const siteConfig = {
  brand,
  languages,
  widget,
  scenes,
  agenda,
  participation,
  social,
} as const

export type SiteConfig = typeof siteConfig
