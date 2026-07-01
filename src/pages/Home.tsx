// ─────────────────────────────────────────────────────────────────────────────
// Home.tsx — Dinédit landing (v5)
//
// Structure :
//   Scenes (hero split flyer + texte)
//   → Intro 2-colonnes "Deux façons de nous rejoindre" (Rejoindre un dîner
//     inédit vs Composer votre propre événement — 2 voies distinctes)
//   → AgendaInline (blog Dinédit par défaut, layout aligné sur /agenda,
//     fond blanc, grille 3 cards)
//   → Gallery (album, plus discret)
//   → Footer
//
// La Gallery a id="gallery" — ancrable via href="#gallery" quand tu voudras.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'
import VideoHero from '../sections/VideoHero'
import Scenes from '../sections/Scenes'
import Gallery from '../sections/Gallery'
import AgendaInline from '../sections/AgendaInline'
import Footer from '../sections/Footer'
import { openAnaisWithArchitectes } from '../lib/anaisIntent'

export default function Home() {
  const { t } = useTranslation(['home', 'common'])
  const { lang } = useAppLanguage()
  const location = useLocation()
  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`

  useEffect(() => {
    if (location.hash === '#agenda') {
      const scroll = () => {
        const el = document.getElementById('agenda')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      const id = window.setTimeout(scroll, 120)
      return () => window.clearTimeout(id)
    }
  }, [location.hash])

  return (
    <>
      <VideoHero />
      <Scenes />

      <section className="bg-bone py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl text-center text-nuit mb-12">
            {t('home:intro.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Voie 1 — Rejoindre un dîner inédit (personnel OU groupe entreprise) */}
            <article className="p-8 rounded-2xl bg-nuit text-bone">
              <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">
                {t('home:intro.voie_diner.label')}
              </p>
              <p className="font-display text-lg md:text-xl leading-snug mb-6">
                {t('home:intro.voie_diner.text')}
              </p>
              <Link
                to={`${prefix}/agenda`}
                className="inline-block text-sm border-b border-gold text-gold hover:text-gold-light transition-colors"
              >
                {t('home:intro.voie_diner.cta')} →
              </Link>
            </article>

            {/* Voie 2 — Composer un événement sur mesure (Anaïs prend la relève) */}
            <article className="p-8 rounded-2xl border border-nuit/15 bg-bone">
              <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">
                {t('home:intro.voie_compose.label')}
              </p>
              <p className="font-display text-lg md:text-xl leading-snug text-nuit mb-6">
                {t('home:intro.voie_compose.text')}
              </p>
              <button
                type="button"
                onClick={() => openAnaisWithArchitectes(lang)}
                className="inline-block text-sm border-b border-nuit/40 text-nuit hover:text-gold hover:border-gold transition-colors"
              >
                {t('home:intro.voie_compose.cta')} →
              </button>
            </article>
          </div>
        </div>
      </section>

      <AgendaInline />
      <Gallery />

      <Footer />
    </>
  )
}
