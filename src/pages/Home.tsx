// ─────────────────────────────────────────────────────────────────────────────
// Home.tsx — Dinédit landing (Phase 3 : Scenes hero + AgendaInline)
//
// Structure : Scenes (hero rotatif flyers events, plein écran) → Intro
// 2-colonnes BtoC/BtoB → AgendaInline (3 cards events) → Footer.
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'
import Scenes from '../sections/Scenes'
import AgendaInline from '../sections/AgendaInline'
import Footer from '../sections/Footer'

export default function Home() {
  const { t } = useTranslation(['home', 'common'])
  const { lang } = useAppLanguage()
  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`

  return (
    <>
      <Scenes />

      <section className="bg-bone py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl text-center text-nuit mb-12">
            {t('home:intro.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <article className="p-8 rounded-2xl bg-nuit text-bone">
              <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">
                {t('home:intro.btoc.label')}
              </p>
              <p className="font-display text-xl leading-snug">
                {t('home:intro.btoc.text')}
              </p>
              <Link
                to={`${prefix}/agenda`}
                className="inline-block mt-6 text-sm border-b border-gold text-gold hover:text-gold-light transition-colors"
              >
                {t('home:hero.cta_agenda')} →
              </Link>
            </article>
            <article className="p-8 rounded-2xl border border-nuit/15 bg-bone">
              <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">
                {t('home:intro.btob.label')}
              </p>
              <p className="font-display text-xl leading-snug text-nuit">
                {t('home:intro.btob.text')}
              </p>
              <Link
                to={`${prefix}/architectes`}
                className="inline-block mt-6 text-sm border-b border-nuit/40 text-nuit hover:text-gold hover:border-gold transition-colors"
              >
                {t('common:nav.architectes')} →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <AgendaInline />

      <Footer />
    </>
  )
}
