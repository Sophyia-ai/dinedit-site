// ─────────────────────────────────────────────────────────────────────────────
// VideoHero.tsx — Dinédit premier hero (vidéo pleine page)
//
// Se place au-dessus de <Scenes /> pour créer un "double hero" :
//   1) VideoHero : ambiance immersive, vidéo autoplay + muet + loop
//   2) Scenes    : hero rotatif d'événements
//
// Duplique le top bar (logo + LanguagePill) de Scenes pour continuité visuelle.
// Indicateur "défiler" en bas centre → scroll doux vers la section suivante.
// ─────────────────────────────────────────────────────────────────────────────

import { ChevronDown } from 'lucide-react'

import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'
import LanguagePill from '../components/LanguagePill'

export default function VideoHero() {
  const { lang } = useAppLanguage()

  const scrollNext = () => {
    const el = document.getElementById('scenes-hero')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative w-full h-screen overflow-hidden bg-nuit">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/video/homepage_hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* Voile léger pour lisibilité du top bar */}
      <div className="absolute inset-0 bg-gradient-to-b from-nuit-dark/45 via-transparent to-nuit-dark/55 pointer-events-none" />

      {/* Top bar : logo (gauche) + LanguagePill (droite) — même position que Scenes */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 md:px-12 py-6">
        <a
          href={lang === siteConfig.languages.default ? '/' : `/${lang}`}
          aria-label={siteConfig.brand.name}
          className="transition-transform hover:scale-105"
        >
          <img
            src={siteConfig.brand.logoPath}
            alt={siteConfig.brand.name}
            className="h-12 md:h-16 w-auto brightness-0 invert opacity-95"
          />
        </a>
        <LanguagePill variant="overlay" />
      </div>

      {/* Indicateur défiler */}
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Défiler vers la programmation"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-bone/85 hover:text-gold transition-colors group"
      >
        <span className="text-[10px] tracking-[0.35em] uppercase">{siteConfig.brand.tagline}</span>
        <ChevronDown className="w-5 h-5 animate-bounce" strokeWidth={1.5} />
      </button>
    </section>
  )
}
