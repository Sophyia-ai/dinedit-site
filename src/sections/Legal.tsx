// ─────────────────────────────────────────────────────────────────────────────
// Legal.tsx — chassis-generic legal modal
// Sections defined declaratively; copy lives in src/locales/<lang>/legal.json.
// ─────────────────────────────────────────────────────────────────────────────

import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface LegalProps {
  type: 'mentions' | 'privacy' | 'cgu'
  onClose: () => void
}

const SECTIONS: Record<LegalProps['type'], string[]> = {
  mentions: ['publisher', 'design', 'hosting', 'ip', 'law'],
  privacy: ['controller', 'data', 'reservation', 'processors', 'cookies', 'anais', 'rights', 'contact'],
  cgu: ['description', 'nature', 'bookings', 'liability', 'use', 'ip', 'law', 'contact'],
}

const DATE_LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  de: 'de-DE',
  it: 'it-IT',
  ru: 'ru-RU',
  nl: 'nl-NL',
  he: 'he-IL',
}

export default function Legal({ type, onClose }: LegalProps) {
  const { t, i18n } = useTranslation('legal')
  const today = new Date().toLocaleDateString(
    DATE_LOCALES[i18n.language] || 'en-GB',
    { day: '2-digit', month: 'long', year: 'numeric' },
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 overflow-y-auto"
      style={{ background: 'rgba(28,27,25,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-3xl rounded-3xl overflow-hidden mb-8 bg-bone border border-nuit/10">
        <div className="flex items-center justify-between p-8 pb-6 border-b border-nuit/10">
          <h2 className="text-xl font-display font-bold text-nuit">{t(`titles.${type}`)}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-nuit/5 hover:bg-nuit/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-nuit" />
          </button>
        </div>
        <div className="p-8 text-sm leading-relaxed text-nuit/75">
          <p className="text-xs mb-8 text-nuit/40">{t('updated')} : {today}</p>

          {SECTIONS[type].map(sectionKey => (
            <div key={sectionKey} className="mb-6">
              <h3 className="text-base font-semibold text-nuit mb-2 pb-2 border-b border-nuit/10">
                {t(`${type}.${sectionKey}.title`)}
              </h3>
              <p>{t(`${type}.${sectionKey}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
