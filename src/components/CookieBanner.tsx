// ─────────────────────────────────────────────────────────────────────────────
// CookieBanner.tsx — chassis-generic RGPD banner
// Reads labels from common.json (cookies namespace).
// Storage key per-client = "<botId>_cookie_consent" so cloned sites don't share state.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { siteConfig } from '../config/site'

const CONSENT_KEY = `${siteConfig.widget.botId}_cookie_consent`

export default function CookieBanner() {
  const { t } = useTranslation('common')
  const [visible, setVisible] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    setShowPrefs(false)
  }
  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
    setShowPrefs(false)
  }
  const resetConsent = () => {
    localStorage.removeItem(CONSENT_KEY)
    setVisible(true)
    setShowPrefs(false)
  }

  return (
    <>
      {visible && (
        <div
          className="fixed bottom-0 inset-x-0 z-[9999] p-4 md:p-6"
          style={{ background: 'rgba(245,239,224,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(28,27,25,0.08)' }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="flex-1 text-sm text-nuit/80 leading-relaxed">
              🍪 {t('cookies.message')}
            </p>
            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={decline}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-nuit/15 text-nuit/70 hover:bg-nuit/5 transition-all"
              >
                {t('cookies.decline')}
              </button>
              <button
                onClick={accept}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gold text-bone hover:bg-gold-dark transition-all"
              >
                {t('cookies.accept')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrefs && (
        <div
          className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-4"
          style={{ background: 'rgba(28,27,25,0.45)', backdropFilter: 'blur(4px)' }}
        >
          <div className="w-full max-w-md rounded-2xl p-6 bg-bone border border-nuit/10">
            <h3 className="text-lg font-semibold text-nuit mb-2">{t('cookies.manageTitle')}</h3>
            <p className="text-sm text-nuit/60 mb-6">{t('cookies.manageText')}</p>
            <div className="flex flex-col gap-3">
              <button onClick={accept} className="w-full px-5 py-3 rounded-lg text-sm font-medium bg-gold text-bone">
                {t('cookies.accept')}
              </button>
              <button onClick={decline} className="w-full px-5 py-3 rounded-lg text-sm font-medium border border-nuit/15 text-nuit/70">
                {t('cookies.decline')}
              </button>
              <button onClick={resetConsent} className="w-full px-5 py-3 rounded-lg text-sm text-nuit/50">
                {t('cookies.reset')}
              </button>
              <button onClick={() => setShowPrefs(false)} className="w-full px-5 py-3 rounded-lg text-sm text-nuit/40">
                {t('cookies.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {!visible && (
        <button
          id="cookie-prefs-btn"
          onClick={() => setShowPrefs(true)}
          className="hidden"
          aria-hidden="true"
        />
      )}
    </>
  )
}

export function openCookiePrefs() {
  document.getElementById('cookie-prefs-btn')?.click()
}
