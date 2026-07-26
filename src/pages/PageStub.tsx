// ─────────────────────────────────────────────────────────────────────────────
// PageStub.tsx — coquille minimale pour les pages dont le contenu arrive en Track 2.
// Titre + message « contenu à venir ». Rendue dans le <main> de Layout.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'

export default function PageStub({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation('common')

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center py-16">
      <h1 className="font-display text-4xl md:text-5xl text-nuit">{t(titleKey)}</h1>
      <p className="mt-6 text-sm uppercase tracking-[0.25em] text-gold">{t('stub.soon')}</p>
    </section>
  )
}
