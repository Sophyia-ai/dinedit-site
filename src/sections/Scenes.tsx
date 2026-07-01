// ─────────────────────────────────────────────────────────────────────────────
// Scenes.tsx — Dinédit hero rotatif
//
// Utilise les flyers events comme scènes hero : chaque flyer est une œuvre
// de saison, présentée en portrait centrée sur fond nuit, avec l'excerpt
// de l'event en overlay bas et un lien vers la page article statique.
//
// Lit /agenda_data.json (upcoming). Auto-rotation 8s. Sur < 3 upcoming,
// tourne sur ce qu'il y a. Sur 0 upcoming, fallback vers page tagline sobre.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { siteConfig } from '../config/site'
import { useAppLanguage, type Language } from '../context/LanguageContext'
import LanguagePill from '../components/LanguagePill'

interface SceneEvent {
  slug: string
  flyer: string | null
  title: Record<string, string>
  excerpt: Record<string, string>
  date_start: string
}

function eventUrl(slug: string, lang: Language) {
  return lang === 'fr' ? `/events/${slug}.html` : `/events/${lang}/${slug}.html`
}

function pickLang(d: Record<string, string>, lang: string): string {
  return d[lang] || d.fr || Object.values(d)[0] || ''
}

export default function Scenes() {
  const { t } = useTranslation(['home', 'common'])
  const { lang } = useAppLanguage()
  const [scenes, setScenes] = useState<SceneEvent[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    fetch('/agenda_data.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setScenes((d.upcoming || []).filter((e: SceneEvent) => e.flyer).slice(0, 6)))
      .catch(() => setScenes([]))
  }, [])

  useEffect(() => {
    if (scenes.length < 2) return
    const id = setInterval(() => setActive(i => (i + 1) % scenes.length), 8000)
    return () => clearInterval(id)
  }, [scenes.length])

  // Fallback pas d'events : hero tagline sobre
  if (scenes.length === 0) {
    return (
      <section className="relative min-h-[88vh] bg-bone flex flex-col">
        <div className="absolute top-5 right-6 z-10">
          <LanguagePill variant="overlay" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <img src={siteConfig.brand.logoPath} alt={siteConfig.brand.name} className="h-24 md:h-32 w-auto mb-8 opacity-95" />
          <p className="font-display text-2xl md:text-4xl leading-snug max-w-2xl text-nuit/90">
            {t('home:hero.tagline')}
          </p>
          <p className="mt-4 text-sm tracking-[0.3em] uppercase text-gold">{siteConfig.brand.tagline}</p>
        </div>
      </section>
    )
  }

  const scene = scenes[active]

  return (
    <section className="relative h-screen w-full overflow-hidden bg-nuit">
      {/* Backdrop images (portrait, centrées, fond nuit sur les côtés) */}
      {scenes.map((s, i) => (
        <div
          key={s.slug}
          className="absolute inset-0 transition-opacity ease-out flex items-center justify-center"
          style={{
            opacity: i === active ? 1 : 0,
            transitionDuration: '1200ms',
          }}
        >
          {/* Blur version en background pour habiller les côtés */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${s.flyer})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(40px) brightness(0.35) saturate(0.7)',
              transform: 'scale(1.15)',
            }}
          />
          {/* Flyer en portrait centré, hauteur 82vh, aspect ratio préservé */}
          <img
            src={s.flyer || ''}
            alt={pickLang(s.title, lang)}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="relative h-[82vh] w-auto max-w-[92vw] object-contain shadow-2xl"
            style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.55)' }}
          />
        </div>
      ))}

      {/* Vignette bas pour lire l'overlay */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-nuit-dark via-nuit-dark/70 to-transparent pointer-events-none" />

      {/* Top bar : logo + LanguagePill */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 md:px-10 py-6">
        <a href={lang === siteConfig.languages.default ? '/' : `/${lang}`} aria-label={siteConfig.brand.name} className="transition-transform hover:scale-105">
          <img src={siteConfig.brand.logoPath} alt={siteConfig.brand.name} className="h-12 md:h-16 w-auto brightness-0 invert opacity-95" />
        </a>
        <LanguagePill variant="overlay" />
      </div>

      {/* Overlay bas : excerpt event + CTA vers page article */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-16 md:pb-20 pointer-events-none">
        <div key={`overlay-${active}-${lang}`} className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{t('home:hero.tagline')}</p>
          <p className="font-display text-2xl md:text-3xl leading-snug text-bone/95" style={{ textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}>
            {pickLang(scene.excerpt, lang)}
          </p>
          <a
            href={eventUrl(scene.slug, lang)}
            className="pointer-events-auto inline-block mt-8 px-7 py-2.5 text-bone/95 border border-bone/45 rounded-full backdrop-blur-sm hover:bg-gold hover:text-nuit hover:border-gold transition-all font-sans text-xs tracking-[0.25em] uppercase"
          >
            {t('home:hero.cta_agenda')}
          </a>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center pointer-events-auto">
        {scenes.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="h-[2px] transition-all duration-500 rounded-full"
            style={{
              width: i === active ? 44 : 16,
              backgroundColor: i === active ? '#C9A063' : 'rgba(255,255,255,0.45)',
            }}
            aria-label={`Scene ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
