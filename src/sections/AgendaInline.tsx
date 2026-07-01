// ─────────────────────────────────────────────────────────────────────────────
// AgendaInline.tsx — section agenda sur la home (équivalent du Blog inline Villa)
//
// Lit /agenda_data.json, montre les upcoming events en cards, avec un lien
// vers la page /agenda complète. Sert de parade SEO + preview immédiat.
// Cliquer sur une card → page article statique /events/<lang>/<slug>.html.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { siteConfig } from '../config/site'
import { useAppLanguage, type Language } from '../context/LanguageContext'

interface EventCard {
  slug: string
  status: string
  date_start: string
  flyer: string | null
  capacity: number
  price_btoc_eur: number | null
  city: string
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

function eventUrl(slug: string, lang: Language): string {
  return lang === 'fr' ? `/events/${slug}.html` : `/events/${lang}/${slug}.html`
}

export default function AgendaInline() {
  const { t } = useTranslation(['agenda', 'home', 'common'])
  const { lang } = useAppLanguage()
  const [events, setEvents] = useState<EventCard[]>([])

  useEffect(() => {
    fetch('/agenda_data.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEvents((d.upcoming || []).slice(0, 3)))
      .catch(() => setEvents([]))
  }, [])

  if (events.length === 0) return null

  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`

  return (
    <section id="agenda-inline" className="bg-bone py-16 md:py-24 border-t border-nuit/8">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
            {siteConfig.brand.tagline}
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-nuit">
            {t('agenda:title')}
          </h2>
          <p className="mt-3 text-nuit/70 max-w-xl mx-auto text-base">
            {t('agenda:subtitle')}
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => {
            const title = pickLang(event.title, lang)
            const excerpt = pickLang(event.excerpt, lang)
            const date = formatDate(event.date_start, lang)
            return (
              <a
                key={event.slug}
                href={eventUrl(event.slug, lang)}
                className="group rounded-2xl border border-nuit/10 hover:border-gold/60 transition-colors bg-bone overflow-hidden flex flex-col"
              >
                {event.flyer && (
                  <div className="aspect-[3/4] overflow-hidden bg-nuit/5">
                    <img
                      src={event.flyer}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">{date}</p>
                  <h3 className="font-display text-xl text-nuit leading-tight mb-3">{title}</h3>
                  <p className="text-nuit/70 text-sm leading-relaxed flex-1">{excerpt}</p>
                  <p className="mt-4 text-xs text-gold border-b border-gold/40 w-fit">
                    {t('agenda:card.see_more')} →
                  </p>
                </div>
              </a>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to={`${prefix}/agenda`}
            className="inline-block px-6 py-2.5 rounded-full text-sm text-nuit border border-nuit/30 hover:border-gold hover:text-gold transition-colors"
          >
            {t('home:hero.cta_agenda')} →
          </Link>
        </div>
      </div>
    </section>
  )
}
