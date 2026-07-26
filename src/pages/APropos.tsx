// ─────────────────────────────────────────────────────────────────────────────
// APropos.tsx — « À propos » (brief §5) : histoire des fondateurs + charte ESG.
// Namespace i18n 'pages' > apropos. Photos fondateurs à fournir (Track 2+).
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'
import { Leaf, HeartHandshake, Scale } from 'lucide-react'

import { useSeo } from '../lib/useSeo'

export default function APropos() {
  const { t } = useTranslation('pages')

  useSeo({ title: t('apropos.title'), description: t('apropos.founders.intro'), path: '/a-propos' })

  const pillars = [
    { icon: Leaf,           key: 'environment' },
    { icon: HeartHandshake, key: 'social' },
    { icon: Scale,          key: 'governance' },
  ] as const

  return (
    <div className="pb-24">
      {/* Fondateurs */}
      <header className="text-center max-w-3xl mx-auto pt-8 pb-10">
        <h1 className="font-display text-4xl md:text-5xl text-nuit">{t('apropos.title')}</h1>
      </header>

      <section className="max-w-2xl mx-auto space-y-5 text-nuit/80 leading-relaxed mb-20">
        <p className="font-display text-xl text-nuit text-center">{t('apropos.founders.intro')}</p>
        <p>{t('apropos.founders.serge')}</p>
        <p>{t('apropos.founders.fany')}</p>
        <p>{t('apropos.founders.genesis')}</p>
      </section>

      {/* Charte ESG */}
      <section className="border-t border-nuit/10 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl text-nuit">{t('apropos.esg.title')}</h2>
          <p className="mt-3 text-nuit/60">{t('apropos.esg.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map(({ icon: Icon, key }) => {
            const items = t(`apropos.esg.${key}.items`, { returnObjects: true }) as string[]
            return (
              <div key={key} className="rounded-2xl border border-nuit/10 bg-white p-6">
                <div className="w-11 h-11 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl text-nuit mb-4">{t(`apropos.esg.${key}.title`)}</h3>
                <ul className="space-y-3">
                  {items.map((it, i) => (
                    <li key={i} className="text-sm text-nuit/70 leading-relaxed border-l-2 border-gold/30 pl-3">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
