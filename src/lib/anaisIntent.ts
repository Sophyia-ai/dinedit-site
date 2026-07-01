// ─────────────────────────────────────────────────────────────────────────────
// anaisIntent.ts — helpers pour ouvrir Anaïs depuis un CTA avec un message
// d'amorce enrichi. Elle "prend la relève" côté maîtresse de cérémonie.
//
// Utilise SophyiaChat.openWith(message) exposé par le widget master
// (widget/sophyia-chat.js, injecté par AnaisBubble.tsx au mount).
// ─────────────────────────────────────────────────────────────────────────────

import type { Language } from '../context/LanguageContext'

interface EventContext {
  slug: string
  date_start: string
  title: Record<string, string>
  excerpt: Record<string, string>
}

function pickLang(d: Record<string, string>, lang: Language): string {
  return d[lang] || d.fr || Object.values(d)[0] || ''
}

function formatDate(iso: string, lang: Language): string {
  if (!iso) return ''
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  const locale = lang === 'en' ? 'en-GB' : lang === 'nl' ? 'nl-BE' : 'fr-BE'
  return dt.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// Ouvre la bulle et injecte un message. Si le widget n'est pas encore chargé
// (peu probable après le mount de AnaisBubble), on tente un fallback timid :
// ouvrir la bulle manuellement et poll rapidement.
function callOpenWith(message: string) {
  const w = (window as unknown as { SophyiaChat?: { openWith?: (m: string) => void } }).SophyiaChat
  if (w && typeof w.openWith === 'function') {
    w.openWith(message)
    return
  }
  // Fallback : réessayer après un court délai (widget en cours d'init)
  let attempts = 0
  const id = setInterval(() => {
    attempts += 1
    const w2 = (window as unknown as { SophyiaChat?: { openWith?: (m: string) => void } }).SophyiaChat
    if (w2 && typeof w2.openWith === 'function') {
      clearInterval(id)
      w2.openWith(message)
    } else if (attempts > 20) {
      clearInterval(id)
      console.warn('[Anaïs] widget non prêt après 20 tentatives — clic ignoré')
    }
  }, 150)
}

// ── Amorce : parler d'un event spécifique ──────────────────────────────────
export function openAnaisWithEvent(event: EventContext, lang: Language) {
  const title = pickLang(event.title, lang)
  const excerpt = pickLang(event.excerpt, lang)
  const date = formatDate(event.date_start, lang)
  const message =
    lang === 'en'
      ? `Anaïs, tell me about the singular dinner "${title}" on ${date}. Context: ${excerpt} — what can we experience there, who's invited, and how can I attend?`
      : lang === 'nl'
      ? `Anaïs, vertel me over het unieke diner "${title}" op ${date}. Context: ${excerpt} — wat kunnen we daar beleven, wie is uitgenodigd, en hoe kan ik deelnemen?`
      : `Anaïs, parle-moi du dîner inédit « ${title} » du ${date}. Contexte : ${excerpt} — qu'est-ce qu'on y vit, qui est invité, et comment y participer ?`
  callOpenWith(message)
}

// ── Amorce : concept Dinédit + Architectes (Serge & Fany) ──────────────────
export function openAnaisWithArchitectes(lang: Language) {
  const message =
    lang === 'en'
      ? `Anaïs, introduce me to the Dinédit concept and its Architects, Serge and Fany. I'm thinking of composing an event with the house — either in a personal capacity or for my company. Walk me through the possibilities and, when the intent is clear, propose putting me in touch with Serge and/or Fany.`
      : lang === 'nl'
      ? `Anaïs, stel me het concept van Dinédit voor en zijn Architecten, Serge en Fany. Ik denk erover om samen met jullie een evenement samen te stellen — in persoonlijke naam of namens mijn bedrijf. Leid me door de mogelijkheden en stel me op het gepaste moment voor aan Serge en/of Fany.`
      : `Anaïs, présente-moi le concept Dinédit et ses Architectes, Serge et Fany. Je pense composer un événement avec la maison — à titre personnel ou pour mon entreprise. Expose-moi les possibilités puis, quand l'intention est claire, propose la mise en contact avec Serge et/ou Fany.`
  callOpenWith(message)
}
