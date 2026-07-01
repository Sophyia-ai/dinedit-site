// ─────────────────────────────────────────────────────────────────────────────
// CarnetInline.tsx — section blog éditorial sur la home (sous les events)
//
// 4 rubriques : portraits / carnet-de-cave / comment-se-rendre / agenda-quartier.
// Cards discrètes, ton "carnet", palette bone + nuit + or.
// Lit /carnet_data.json (généré par events_engine.py depuis articles/*.json).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'

import { useAppLanguage, type Language } from '../context/LanguageContext'

interface ArticleCard {
  slug: string
  rubric: string
  date: string
  linked_event: string | null
  hero_image: string | null
  title: Record<string, string>
  excerpt: Record<string, string>
  tags: string[]
  author: string
}

interface CarnetData {
  generated_at: string
  by_rubric: Record<string, ArticleCard[]>
  rubrics: string[]
}

function pickLang(d: Record<string, string>, lang: Language): string {
  return d[lang] || d.fr || Object.values(d)[0] || ''
}

const rubricLabels: Record<string, Record<Language, string>> = {
  portraits: {
    fr: 'Portraits — chefs & artistes',
    en: 'Portraits — chefs & artists',
    nl: 'Portretten — chefs & kunstenaars',
  },
  'carnet-de-cave': {
    fr: 'Carnet de cave',
    en: 'From the cellar',
    nl: 'Uit de kelder',
  },
  'comment-se-rendre': {
    fr: 'Comment se rendre',
    en: 'How to get there',
    nl: 'Hoe raak je er',
  },
  'agenda-quartier': {
    fr: 'Agenda du quartier',
    en: 'Neighbourhood agenda',
    nl: 'Wijkagenda',
  },
}

export default function CarnetInline() {
  const { lang } = useAppLanguage()
  const [data, setData] = useState<CarnetData | null>(null)

  useEffect(() => {
    fetch('/carnet_data.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setData({ generated_at: '', by_rubric: {}, rubrics: [] }))
  }, [])

  if (!data || data.rubrics.length === 0) return null

  // Prend le premier article de chaque rubrique
  const cards = data.rubrics
    .map(rub => {
      const items = data.by_rubric[rub] || []
      return items.length ? { rubric: rub, article: items[0] } : null
    })
    .filter((x): x is { rubric: string; article: ArticleCard } => x !== null)

  if (cards.length === 0) return null

  const carnetTitle = { fr: 'Le carnet', en: 'The notebook', nl: 'Het notitieboek' }[lang] || 'Le carnet'
  const carnetSubtitle = {
    fr: 'Ce qu\'on lit autour du dîner : portraits, vignerons, chemins, quartier.',
    en: 'What we read around the dinner: portraits, winemakers, routes, neighbourhood.',
    nl: 'Wat we lezen rond het diner: portretten, wijnmakers, routes, wijk.',
  }[lang] || ''

  return (
    <section id="carnet-inline" className="bg-bone py-16 md:py-24 border-t border-nuit/10">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Carnet</p>
          <h2 className="font-display text-3xl md:text-4xl text-nuit">
            {carnetTitle}
          </h2>
          <p className="mt-3 text-nuit/70 max-w-xl mx-auto">
            {carnetSubtitle}
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ rubric, article }) => {
            const title = pickLang(article.title, lang)
            const excerpt = pickLang(article.excerpt, lang)
            const label = rubricLabels[rubric]?.[lang] || rubric
            return (
              <article
                key={article.slug}
                className="rounded-2xl border border-nuit/10 hover:border-gold/60 transition-colors bg-bone overflow-hidden flex flex-col p-6"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">{label}</p>
                <h3 className="font-display text-lg text-nuit leading-tight mb-3">{title}</h3>
                <p className="text-nuit/70 text-sm leading-relaxed flex-1">{excerpt}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-nuit/40">
                  {article.author}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
