// ─────────────────────────────────────────────────────────────────────────────
// Scenes.tsx — Dinédit hero rotatif (v2 : split gauche/droite sur desktop)
//
// Desktop  : colonne gauche = texte (titre event + excerpt + CTA)
//            colonne droite = flyer en portrait
// Mobile   : stack vertical, flyer en haut, texte en bas
// Auto-rotation 8 s. Lit /agenda_data.json (upcoming).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { siteConfig } from '../config/site'
import { useAppLanguage, type Language } from '../context/LanguageContext'
import LanguagePill from '../components/LanguagePill'
import { openAnaisWithEvent } from '../lib/anaisIntent'

interface SceneEvent {
  slug: string
  flyer: string | null
  title: Record<string, string>
  excerpt: Record<string, string>
  date_start: string
}

function pickLang(d: Record<string, string>, lang: string): string {
  return d[lang] || d.fr || Object.values(d)[0] || ''
}

function formatDate(iso: string, lang: Language): string {
  if (!iso) return ''
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  const locale = lang === 'en' ? 'en-GB' : lang === 'nl' ? 'nl-BE' : 'fr-BE'
  return dt.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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

  // Fallback : hero tagline sobre
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
  const title = pickLang(scene.title, lang)
  const excerpt = pickLang(scene.excerpt, lang)
  const dateStr = formatDate(scene.date_start, lang)

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-nuit text-bone">
      {/* Backdrop léger : version blur du flyer actif (habille les vides) */}
      {scene.flyer && (
        <div
          key={`bg-${scene.slug}`}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${scene.flyer})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) brightness(0.30) saturate(0.7)',
            transform: 'scale(1.2)',
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-nuit-dark/85 via-nuit-dark/50 to-nuit-dark/70 pointer-events-none" />

      {/* Top bar : logo (gauche) + LanguagePill (droite) */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 md:px-12 py-6">
        <a href={lang === siteConfig.languages.default ? '/' : `/${lang}`} aria-label={siteConfig.brand.name} className="transition-transform hover:scale-105">
          <img src={siteConfig.brand.logoPath} alt={siteConfig.brand.name} className="h-12 md:h-16 w-auto brightness-0 invert opacity-95" />
        </a>
        <LanguagePill variant="overlay" />
      </div>

      {/* Contenu split : texte gauche / flyer droite */}
      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 items-center gap-8 lg:gap-16 px-6 md:px-12 pt-28 lg:pt-0">
        {/* GAUCHE — texte (bas sur mobile, gauche sur desktop) */}
        <div key={`text-${active}-${lang}`} className="order-2 lg:order-1 max-w-xl mx-auto lg:mx-0 lg:pl-6 xl:pl-16 text-center lg:text-left animate-fade-in-up pb-12 lg:pb-0">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
            {dateStr}
          </p>
          <h1 className="font-display text-3xl md:text-4xl xl:text-5xl leading-tight text-bone mb-6" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            {title}
          </h1>
          <p className="font-display text-lg md:text-xl leading-snug text-bone/85 mb-8 italic">
            {excerpt}
          </p>
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => openAnaisWithEvent(scene, lang)}
              className="inline-block px-6 py-2.5 rounded-full bg-gold text-nuit text-sm font-medium tracking-wide hover:bg-gold-light transition-colors"
            >
              {t('home:hero.cta_agenda')} →
            </button>
            <a
              href={lang === siteConfig.languages.default ? '/agenda' : `/${lang}/agenda`}
              className="inline-block px-6 py-2.5 rounded-full border border-bone/45 text-bone/95 text-sm font-medium tracking-wide hover:border-gold hover:text-gold transition-colors"
            >
              {t('agenda:title', 'Agenda')}
            </a>
          </div>
        </div>

        {/* DROITE — flyer portrait (haut sur mobile, droite sur desktop) */}
        <div className="order-1 lg:order-2 flex items-center justify-center lg:justify-start pt-4 lg:pt-0">
          {scenes.map((s, i) => (
            <img
              key={s.slug}
              src={s.flyer || ''}
              alt={pickLang(s.title, lang)}
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`transition-opacity duration-1000 ${i === active ? 'opacity-100' : 'opacity-0 absolute'} max-h-[70vh] lg:max-h-[82vh] w-auto object-contain`}
              style={{ boxShadow: '0 30px 90px -20px rgba(0,0,0,0.65)' }}
            />
          ))}
        </div>
      </div>

      {/* Indicators bas */}
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
