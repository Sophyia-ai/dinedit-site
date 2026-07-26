// ─────────────────────────────────────────────────────────────────────────────
// Entreprises.tsx — offre B2B (brief §5). Privatisation + sur-mesure, bandeau
// partenaires défilant (noms seuls, sans logos), CTA vers Contact.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'

const CTA = 'inline-block px-7 py-3 rounded-full bg-gold text-nuit text-sm font-medium tracking-wide hover:bg-gold-dark transition-colors'

export default function Entreprises() {
  const { t } = useTranslation('pages')
  const { lang } = useAppLanguage()
  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`
  const contact = `${prefix}/contact`

  const items = t('entreprises.options.option2.items', { returnObjects: true }) as string[]
  const partners = t('entreprises.partners.list', { returnObjects: true }) as string[]

  return (
    <div className="pb-24">
      <header className="text-center max-w-3xl mx-auto pt-8 pb-14">
        <h1 className="font-display text-4xl md:text-5xl text-nuit">{t('entreprises.hero.title')}</h1>
        <p className="mt-5 text-lg text-nuit/70 leading-relaxed">{t('entreprises.hero.subtitle')}</p>
      </header>

      <p className="max-w-2xl mx-auto text-center text-nuit/80 leading-relaxed mb-16">
        {t('entreprises.intro')}
      </p>

      <h2 className="font-display text-2xl md:text-3xl text-nuit text-center mb-10">
        {t('entreprises.options.title')}
      </h2>

      <div className="grid md:grid-cols-2 gap-6 items-stretch mb-20">
        {/* Option 1 — privatisation */}
        <div className="flex flex-col rounded-2xl border border-nuit/10 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">{t('entreprises.options.option1.kicker')}</p>
          <h3 className="font-display text-2xl text-nuit mb-4">{t('entreprises.options.option1.title')}</h3>
          <p className="text-sm text-nuit/70 leading-relaxed flex-1">{t('entreprises.options.option1.text')}</p>
          <Link to={contact} className={`${CTA} mt-6 self-start`}>{t('entreprises.options.option1.cta')}</Link>
        </div>

        {/* Option 2 — sur mesure */}
        <div className="flex flex-col rounded-2xl border border-gold/30 bg-gold/5 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">{t('entreprises.options.option2.kicker')}</p>
          <h3 className="font-display text-2xl text-nuit mb-4">{t('entreprises.options.option2.title')}</h3>
          <p className="text-sm text-nuit/70 leading-relaxed mb-4">{t('entreprises.options.option2.intro')}</p>
          <ul className="space-y-2 flex-1">
            {items.map((it, i) => (
              <li key={i} className="flex gap-2 text-sm text-nuit/80">
                <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" strokeWidth={2} />
                <span>{it}</span>
              </li>
            ))}
          </ul>
          <Link to={contact} className={`${CTA} mt-6 self-start`}>{t('entreprises.options.option2.cta')}</Link>
        </div>
      </div>

      {/* Bandeau partenaires — défilement horizontal continu, noms seuls */}
      <section className="mb-20">
        <h2 className="text-xs uppercase tracking-[0.3em] text-nuit/50 text-center mb-8">
          {t('entreprises.partners.title')}
        </h2>
        <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
            {[...partners, ...partners].map((p, i) => (
              <span key={i} className="text-sm text-nuit/60 flex items-center gap-10">
                {p}
                <span className="text-gold/50" aria-hidden="true">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA de fermeture */}
      <section className="text-center">
        <p className="font-display text-2xl md:text-3xl text-nuit mb-6">{t('entreprises.closing.text')}</p>
        <Link to={contact} className={CTA}>{t('entreprises.closing.cta')}</Link>
      </section>
    </div>
  )
}
