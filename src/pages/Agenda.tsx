// ─────────────────────────────────────────────────────────────────────────────
// Agenda.tsx — Dinédit, page liste des events
//
// Lit /agenda_data.json (généré au build par automation/events_engine.py).
// Filtre par défaut : "upcoming". Lien card → page article statique générée
// /events/<lang>/<slug>.html (servie en statique par Azure SWA).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Lang = 'fr' | 'en' | 'nl'
type Status = 'upcoming' | 'past'
type Filter = Status | 'all'

interface EventCard {
  slug: string
  status: Status
  date_start: string
  date_end: string
  flyer: string | null
  capacity: number
  price_btoc_eur: number | null
  city: string
  title: Record<string, string>
  excerpt: Record<string, string>
  guests: { name: string; role: string }[]
  tags: string[]
}

interface AgendaData {
  generated_at: string
  upcoming: EventCard[]
  past: EventCard[]
}

function pickLangValue(d: Record<string, string>, lang: Lang): string {
  return d[lang] || d.fr || Object.values(d)[0] || ''
}

function formatDateHuman(iso: string, lang: Lang): string {
  if (!iso) return ''
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  const locale = lang === 'en' ? 'en-GB' : lang === 'nl' ? 'nl-BE' : 'fr-BE'
  return dt.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function eventUrl(slug: string, lang: Lang): string {
  return lang === 'fr' ? `/events/${slug}.html` : `/events/${lang}/${slug}.html`
}

export default function Agenda() {
  const { t, i18n } = useTranslation(['agenda', 'common'])
  const lang = (i18n.language as Lang) || 'fr'

  const [data, setData] = useState<AgendaData | null>(null)
  const [filter, setFilter] = useState<Filter>('upcoming')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/agenda_data.json')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setData)
      .catch(() => setData({ generated_at: '', upcoming: [], past: [] }))
      .finally(() => setLoading(false))
  }, [])

  const visible: EventCard[] =
    !data ? [] :
    filter === 'upcoming' ? data.upcoming :
    filter === 'past'     ? data.past :
                            [...data.upcoming, ...data.past]

  return (
    <main id="blog" className="bg-bone min-h-screen pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-nuit">{t('agenda:title')}</h1>
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

        {loading ? (
          <p className="text-center text-nuit/50 py-12">{t('common:common.loading')}</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-nuit/50 py-12">{t('agenda:empty')}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map(event => {
              const date = formatDateHuman(event.date_start, lang)
              const title = pickLangValue(event.title, lang)
              const excerpt = pickLangValue(event.excerpt, lang)
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
                    <h2 className="font-display text-xl text-nuit leading-tight mb-3">{title}</h2>
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
      </div>
    </main>
  )
}
