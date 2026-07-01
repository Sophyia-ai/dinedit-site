// ─────────────────────────────────────────────────────────────────────────────
// AgendaInline.tsx — section agenda sur la home (v3)
//
// Layout aligné sur la page /agenda : fond blanc, titre + subtitle centrés,
// filtres upcoming/past/all discrets, grille de cards verticales avec flyer,
// date en or, titre, excerpt, CTA "Voir l'événement" en gold. Sur la home
// on filtre "upcoming" par défaut et on garde la même palette que /agenda
// pour la cohérence.
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

type Filter = 'upcoming' | 'past' | 'all'

export default function AgendaInline() {
  const { t } = useTranslation(['agenda', 'common'])
  const { lang } = useAppLanguage()
  const [upcoming, setUpcoming] = useState<EventCard[]>([])
  const [past, setPast] = useState<EventCard[]>([])
  const [filter, setFilter] = useState<Filter>('upcoming')

  useEffect(() => {
    fetch('/agenda_data.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        setUpcoming(d.upcoming || [])
        setPast(d.past || [])
      })
      .catch(() => { setUpcoming([]); setPast([]) })
  }, [])

  if (upcoming.length === 0 && past.length === 0) return null

  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`
  const visible: EventCard[] =
    filter === 'upcoming' ? upcoming :
    filter === 'past'     ? past :
                            [...upcoming, ...past]

  return (
    <section id="agenda" className="bg-bone py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <header className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-nuit">{t('agenda:title')}</h2>
          <p className="mt-4 text-nuit/70 max-w-xl mx-auto">{t('agenda:subtitle')}</p>
        </header>

        <div className="flex justify-center gap-2 mb-10">
          {(['upcoming', 'past', 'all'] as const).map(key => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                filter === key
                  ? 'bg-nuit text-bone border-nuit'
                  : 'bg-bone text-nuit/70 border-nuit/15 hover:border-gold hover:text-gold'
              }`}
            >
              {t(`agenda:filter.${key}`)}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-center text-nuit/50 py-12">{t('agenda:empty')}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map(event => {
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
        )}

        {filter === 'upcoming' && past.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to={`${prefix}/agenda`}
              className="inline-block px-5 py-2 rounded-full text-sm border border-nuit/30 text-nuit hover:border-gold hover:text-gold transition-colors"
            >
              {t('agenda:filter.past')} →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
