// ─────────────────────────────────────────────────────────────────────────────
// Gallery.tsx — album photo Dinédit
//
// Phase 4 squelette : lit /gallery_data.json quand disponible (généré par un
// futur automation/gallery_engine.py). En attendant les photos glissées par
// Raoul dans sites/dinedit-site/photos/, la section est masquée (retour null).
//
// Vue future : filtre par thème (Ambiances / Table / Portraits / Lieux) +
// filtre par event passé. Chaque photo porte les deux tags.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppLanguage, type Language } from '../context/LanguageContext'

interface Photo {
  src: string
  alt: string
  themes: string[]
  event_slug: string | null
}

interface GalleryData {
  generated_at: string
  photos: Photo[]
  themes: string[]
  events: string[]
}

type FilterKind = 'theme' | 'event'

const themeLabels: Record<string, Record<Language, string>> = {
  ambiances:            { fr: 'Ambiances', en: 'Ambience', nl: 'Sfeer' },
  'table-scenographie': { fr: 'Table & scénographie', en: 'Table & set design', nl: 'Tafel & scenografie' },
  portraits:            { fr: 'Portraits', en: 'Portraits', nl: 'Portretten' },
  lieux:                { fr: 'Lieux insolites', en: 'Singular venues', nl: 'Bijzondere plekken' },
}

export default function Gallery() {
  const { t } = useTranslation('home')
  const { lang } = useAppLanguage()
  const [data, setData] = useState<GalleryData | null>(null)
  const [filterKind, setFilterKind] = useState<FilterKind>('theme')
  const [selected, setSelected] = useState<string>('all')

  useEffect(() => {
    fetch('/gallery_data.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  // Pas de photos → section masquée (revient quand gallery_engine tourne)
  if (!data || data.photos.length === 0) return null

  const filtered = selected === 'all'
    ? data.photos
    : data.photos.filter(p =>
        filterKind === 'theme'
          ? p.themes.includes(selected)
          : p.event_slug === selected,
      )

  return (
    <section id="gallery" className="bg-bone py-16 md:py-24 border-t border-nuit/8">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Album</p>
          <h2 className="font-display text-3xl md:text-4xl text-nuit">
            {t('gallery.title', 'Souvenirs de soirée')}
          </h2>
        </header>

        {/* Bascule Thème / Événement */}
        <div className="flex justify-center gap-2 mb-6">
          {(['theme', 'event'] as const).map(kind => (
            <button
              key={kind}
              onClick={() => { setFilterKind(kind); setSelected('all') }}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                filterKind === kind
                  ? 'bg-nuit text-bone border-nuit'
                  : 'bg-bone text-nuit/70 border-nuit/15 hover:border-gold hover:text-gold'
              }`}
            >
              {kind === 'theme'
                ? (lang === 'en' ? 'By theme' : lang === 'nl' ? 'Op thema' : 'Par thème')
                : (lang === 'en' ? 'By event' : lang === 'nl' ? 'Op evenement' : 'Par événement')}
            </button>
          ))}
        </div>

        {/* Filtres inline (thème ou event) */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setSelected('all')}
            className={`px-3 py-1 rounded-full text-xs border ${
              selected === 'all' ? 'bg-gold text-nuit border-gold' : 'bg-bone text-nuit/60 border-nuit/15'
            }`}
          >
            {lang === 'en' ? 'All' : lang === 'nl' ? 'Alles' : 'Tous'}
          </button>
          {(filterKind === 'theme' ? data.themes : data.events).map(key => {
            const label = filterKind === 'theme'
              ? (themeLabels[key]?.[lang] || key)
              : key
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  selected === key ? 'bg-gold text-nuit border-gold' : 'bg-bone text-nuit/60 border-nuit/15'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Grid photos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
          {filtered.map(p => (
            <div key={p.src} className="aspect-square overflow-hidden bg-nuit/5">
              <img src={p.src} alt={p.alt} loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
