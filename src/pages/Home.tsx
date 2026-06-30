// ─────────────────────────────────────────────────────────────────────────────
// Home.tsx — Dinédit landing
//
// Phase 1 squelette : hero logo + tagline + 2 CTA (BtoC / BtoB), intro
// 2-colonnes (Pour vous / Pour votre entreprise), footer.
// L'agenda inline viendra en Phase 2 (events_engine.py → agenda_data.json).
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'
import LanguagePill from '../components/LanguagePill'
import Footer from '../sections/Footer'

export default function Home() {
  const { t } = useTranslation(['home', 'common'])
  const { lang } = useAppLanguage()
  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`

  return (
    <>
      <header className="relative min-h-[88vh] bg-bone text-nuit flex flex-col">
        <div className="absolute top-5 right-6 z-10">
          <LanguagePill variant="overlay" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <img
            src={siteConfig.brand.logoPath}
            alt={siteConfig.brand.name}
            className="h-20 md:h-28 w-auto mb-8 opacity-95"
          />
          <p className="font-display text-2xl md:text-4xl leading-snug max-w-2xl text-nuit/90">
            {t('home:hero.tagline')}
          </p>
          <p className="mt-4 text-sm tracking-[0.3em] uppercase text-gold">
            {siteConfig.brand.tagline}
          </p>

          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            <Link
              to={`${prefix}/agenda`}
              className="px-6 py-3 rounded-full bg-nuit text-bone text-sm font-medium tracking-wide hover:bg-nuit-light transition-colors"
            >
              {t('home:hero.cta_agenda')}
            </Link>
            <Link
              to={`${prefix}/architectes`}
              className="px-6 py-3 rounded-full border border-nuit/30 text-nuit text-sm font-medium tracking-wide hover:border-gold hover:text-gold transition-colors"
            >
              {t('home:hero.cta_btob')}
            </Link>
          </div>
        </div>
      </header>

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

      <Footer />
    </>
  )
}
