// ─────────────────────────────────────────────────────────────────────────────
// APropos.tsx — « À propos » Dinédit : Serge & Fany, fondateurs (2017) + genèse.
//
// Refonte Track 1 de l'ancien Architectes.tsx (route /architectes → /a-propos).
// Contenu conservé (namespace i18n 'architectes') — raffinage copy = Track 2.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'

export default function APropos() {
  const { t } = useTranslation('architectes')

  return (
    <div className="pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <header className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl text-nuit">{t('title')}</h1>
          <p className="mt-4 text-nuit/70 max-w-xl mx-auto font-display text-xl">
            {t('subtitle')}
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-10 mb-20">
          {(['serge', 'fany'] as const).map(person => (
            <article key={person} className="text-center md:text-left">
              <div className="aspect-square rounded-2xl bg-nuit/5 border border-nuit/10 mb-5 flex items-center justify-center">
                <span className="text-nuit/30 text-sm italic">Photo {t(`${person}.name`)}</span>
              </div>
              <h2 className="font-display text-2xl text-nuit">{t(`${person}.name`)}</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-gold mt-1 mb-4">
                {t(`${person}.role`)}
              </p>
              <p className="text-nuit/80 leading-relaxed text-sm">{t(`${person}.bio`)}</p>
            </article>
          ))}
        </div>

        <section className="border-t border-nuit/10 pt-14">
          <h2 className="font-display text-3xl text-nuit text-center mb-6">
            {t('genesis.title')}
          </h2>
          <p className="text-nuit/80 leading-relaxed max-w-2xl mx-auto text-center">
            {t('genesis.text')}
          </p>
        </section>
      </div>
    </div>
  )
}
