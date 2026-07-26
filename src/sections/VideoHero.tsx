// ─────────────────────────────────────────────────────────────────────────────
// VideoHero.tsx — Dinédit premier hero (vidéo pleine page)
//
// Se place au-dessus de <Scenes /> pour créer un "double hero" :
//   1) VideoHero : ambiance immersive, vidéo autoplay + muet + loop
//   2) Scenes    : hero rotatif d'événements
//
// Le header (logo + langue + menu) est global (Navigation via Root) — pas de top
// bar local ici, sinon double/triple header sur la home.
// Indicateur "défiler" en bas centre → scroll doux vers la section suivante.
// ─────────────────────────────────────────────────────────────────────────────

import { ChevronDown } from 'lucide-react'

import { siteConfig } from '../config/site'

export default function VideoHero() {
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

      {/* Voile léger pour lisibilité du header global en overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-nuit-dark/45 via-transparent to-nuit-dark/55 pointer-events-none" />

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
