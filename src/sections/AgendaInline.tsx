// ─────────────────────────────────────────────────────────────────────────────
// AgendaInline.tsx — section events sur la home (hiérarchie featured + petites)
//
// Layout : 1 grande card XL pour le prochain dîner (2/3 de la largeur en desktop)
// + 2 petites cards en colonne à droite. Sous 3 events → adapte.
// Lit /agenda_data.json (upcoming, chrono ascendant).
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

function daysUntil(iso: string): number | null {
  if (!iso) return null
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return null
  const now = new Date()
  const diff = Math.ceil((dt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function AgendaInline() {
  const { t } = useTranslation(['agenda', 'home', 'common'])
  const { lang } = useAppLanguage()
  const [events, setEvents] = useState<EventCard[]>([])

  useEffect(() => {
    fetch('/agenda_data.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEvents(d.upcoming || []))
      .catch(() => setEvents([]))
  }, [])

  if (events.length === 0) return null

  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`
  const [featured, ...rest] = events
  const sideEvents = rest.slice(0, 2)

  const featuredDate = formatDate(featured.date_start, lang)
  const featuredTitle = pickLang(featured.title, lang)
  const featuredExcerpt = pickLang(featured.excerpt, lang)
  const featuredDays = daysUntil(featured.date_start)

  const daysLabel = (n: number): string => {
    if (lang === 'en') return n === 1 ? 'in 1 day' : `in ${n} days`
    if (lang === 'nl') return n === 1 ? 'over 1 dag' : `over ${n} dagen`
    return n === 1 ? 'dans 1 jour' : `dans ${n} jours`
  }

  return (
    <section id="events-inline" className="bg-nuit py-16 md:py-24 text-bone">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
            {siteConfig.brand.tagline}
          </p>
          <h2 className="font-display text-3xl md:text-5xl">
            {t('agenda:title')}
          </h2>
          <p className="mt-3 text-bone/70 max-w-xl mx-auto">
            {t('agenda:subtitle')}
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured — grande card XL sur 2 colonnes */}
          <a
            href={eventUrl(featured.slug, lang)}
            className="lg:col-span-2 group rounded-3xl border border-bone/15 hover:border-gold transition-colors overflow-hidden bg-nuit-light flex flex-col"
          >
            {featured.flyer && (
              <div className="aspect-[16/9] md:aspect-[16/10] overflow-hidden bg-nuit-dark">
                <img
                  src={featured.flyer}
                  alt={featuredTitle}
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                  style={{ backgroundColor: '#11192E' }}
                />
              </div>
            )}
            <div className="p-8 md:p-10 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs uppercase tracking-[0.25em] text-gold">{featuredDate}</span>
                {featuredDays !== null && featuredDays >= 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold">
                    {daysLabel(featuredDays)}
                  </span>
                )}
              </div>
              <h3 className="font-display text-2xl md:text-3xl leading-tight mb-4">{featuredTitle}</h3>
              <p className="text-bone/75 leading-relaxed flex-1">{featuredExcerpt}</p>
              <p className="mt-6 text-sm text-gold border-b border-gold/50 w-fit">
                {t('agenda:card.see_more')} →
              </p>
            </div>
          </a>

          {/* 2 petites cards à droite */}
          <div className="flex flex-col gap-6">
            {sideEvents.map(event => {
              const date = formatDate(event.date_start, lang)
              const title = pickLang(event.title, lang)
              return (
                <a
                  key={event.slug}
                  href={eventUrl(event.slug, lang)}
                  className="group rounded-2xl border border-bone/15 hover:border-gold transition-colors overflow-hidden bg-nuit-light flex flex-1"
                >
                  {event.flyer && (
                    <div className="w-1/3 min-w-[120px] overflow-hidden bg-nuit-dark">
                      <img
                        src={event.flyer}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">{date}</p>
                    <h3 className="font-display text-lg leading-tight text-bone">{title}</h3>
                    <p className="mt-3 text-[11px] text-gold border-b border-gold/40 w-fit">
                      {t('agenda:card.see_more')} →
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            to={`${prefix}/agenda`}
            className="inline-block px-8 py-3 rounded-full bg-gold text-nuit text-sm font-medium tracking-wide hover:bg-gold-light transition-colors"
          >
            {t('home:hero.cta_agenda')} →
          </Link>
        </div>
      </div>
    </section>
  )
}
