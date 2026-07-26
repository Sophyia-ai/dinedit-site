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
import { useSeo } from '../lib/useSeo'

export default function Home() {
  const { t } = useTranslation(['home', 'common'])
  const { lang } = useAppLanguage()
  const location = useLocation()
  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`

  useSeo({
    title: `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`,
    description: t('home:hero.tagline'),
    path: '/',
  })

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

  const testimonials = t('home:testimonials.items', { returnObjects: true }) as { quote: string; author: string }[]

  return (
    <>
      <VideoHero />
      <Scenes />

      {/* Dinédit, c'est quoi ? */}
      <section className="bg-bone py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-display text-2xl md:text-3xl text-nuit leading-snug mb-8">
            {t('home:identity.kicker')}
          </p>
          <p className="text-nuit/75 leading-relaxed mb-5">{t('home:identity.p1')}</p>
          <p className="text-nuit/75 leading-relaxed mb-8">{t('home:identity.p2')}</p>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">{t('home:identity.closing')}</p>
        </div>
      </section>

      {/* Aiguillage — Deux façons de nous rejoindre */}
      <section className="bg-nuit/[0.03] border-y border-nuit/10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl text-center text-nuit mb-12">
            {t('home:intro.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Voie 1 — Voir la programmation */}
            <article className="flex flex-col p-8 rounded-2xl bg-nuit text-bone">
              <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">
                {t('home:intro.voie_diner.label')}
              </p>
              <p className="font-display text-lg md:text-xl leading-snug mb-8 flex-1">
                {t('home:intro.voie_diner.text')}
              </p>
              <Link
                to={`${prefix}/agenda`}
                className="inline-block self-start px-6 py-2.5 rounded-full bg-gold text-nuit text-sm font-medium tracking-wide hover:bg-gold-light transition-colors"
              >
                {t('home:intro.voie_diner.cta')}
              </Link>
            </article>

            {/* Voie 2 — Organiser un événement → Contact (pas le chat, cf. §6 + Fany) */}
            <article className="flex flex-col p-8 rounded-2xl border border-nuit/15 bg-bone">
              <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">
                {t('home:intro.voie_compose.label')}
              </p>
              <p className="font-display text-lg md:text-xl leading-snug text-nuit mb-8 flex-1">
                {t('home:intro.voie_compose.text')}
              </p>
              <Link
                to={`${prefix}/contact`}
                className="inline-block self-start px-6 py-2.5 rounded-full border border-nuit/30 text-nuit text-sm font-medium tracking-wide hover:border-gold hover:text-gold transition-colors"
              >
                {t('home:intro.voie_compose.cta')}
              </Link>
            </article>
          </div>
        </div>
      </section>

      <AgendaInline />

      {/* Témoignages */}
      <section className="bg-bone py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl text-center text-nuit mb-12">
            {t('home:testimonials.title')}
          </h2>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {testimonials.map((tm, i) => (
              <figure key={i} className="mb-6 break-inside-avoid rounded-2xl border border-nuit/10 bg-white p-6">
                <blockquote className="text-sm text-nuit/80 leading-relaxed italic">“{tm.quote}”</blockquote>
                <figcaption className="mt-4 text-xs uppercase tracking-[0.2em] text-gold not-italic">— {tm.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Gallery />

      <Footer />
    </>
  )
}
