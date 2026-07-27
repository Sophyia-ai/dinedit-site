// ─────────────────────────────────────────────────────────────────────────────
// DevenirMembre.tsx — statut membre payant (brief §5).
// Contenu FR final. Le paiement/cotisation (Stripe) = Track 5 → CTA vers Contact
// en attendant. Rendu dans le <main> de Layout.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'
import { Tag, Images, Users, Sparkles } from 'lucide-react'

import { useSeo } from '../lib/useSeo'

const ICONS = [Tag, Images, Users, Sparkles]

export default function DevenirMembre() {
  const { t } = useTranslation('pages')

  useSeo({ title: t('membre.hero.title'), description: t('membre.hero.subtitle'), path: '/devenir-membre' })

  const benefits = t('membre.benefits.items', { returnObjects: true }) as { title: string; text: string }[]

  return (
    <div className="pb-24">
      <header className="text-center max-w-3xl mx-auto pt-8 pb-16">
        <h1 className="font-display text-4xl md:text-5xl text-nuit">{t('membre.hero.title')}</h1>
        <p className="mt-5 text-lg text-nuit/70 leading-relaxed">{t('membre.hero.subtitle')}</p>
      </header>

      <section className="mb-20">
        <h2 className="font-display text-2xl md:text-3xl text-nuit text-center mb-10">
          {t('membre.benefits.title')}
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {benefits.map((b, i) => {
            const Icon = ICONS[i] ?? Sparkles
            return (
              <div key={i} className="rounded-2xl border border-nuit/10 bg-white p-6">
                <div className="w-11 h-11 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl text-nuit mb-2">{b.title}</h3>
                <p className="text-sm text-nuit/70 leading-relaxed">{b.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="max-w-xl mx-auto text-center rounded-3xl border border-gold/30 bg-gold/5 p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{t('membre.price.title')}</p>
        <p className="font-display text-nuit">
          <span className="text-5xl">{t('membre.price.amount')}</span>
          <span className="text-xl text-nuit/60"> {t('membre.price.period')}</span>
        </p>
        <p className="mt-5 text-sm text-nuit/70 leading-relaxed">{t('membre.price.text')}</p>
        <p className="mt-3 text-xs text-nuit/50">{t('membre.price.note')}</p>
        <a
          href="/api/checkout?type=membre"
          className="inline-block mt-8 px-8 py-3 rounded-full bg-gold text-nuit font-medium tracking-wide hover:bg-gold-dark transition-colors"
        >
          {t('membre.cta')}
        </a>
      </section>
    </div>
  )
}
