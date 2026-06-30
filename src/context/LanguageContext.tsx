// ─────────────────────────────────────────────────────────────────────────────
// LanguageContext.tsx — chassis i18n + URL bridge (generic, reusable)
//
// Reads the language from the URL prefix (e.g. /en/journal), syncs i18next,
// updates <html lang dir> for accessibility + RTL CSS, and exposes a helper
// to switch language (which navigates to the equivalent URL in the new lang).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { siteConfig, type Language } from '../config/site'
import { isRtl } from '../i18n'

export type { Language }

const SUPPORTED = siteConfig.languages.supported as readonly string[]
const DEFAULT_LANG = siteConfig.languages.default

export function getLangFromPath(pathname: string): Language {
  const first = pathname.split('/').filter(Boolean)[0]
  if (first && SUPPORTED.includes(first)) return first as Language
  return DEFAULT_LANG
}

export function buildPathWithLang(pathname: string, newLang: Language): string {
  const segs = pathname.split('/').filter(Boolean)
  if (segs[0] && SUPPORTED.includes(segs[0])) segs.shift()
  if (newLang !== DEFAULT_LANG) segs.unshift(newLang)
  return '/' + segs.join('/')
}

export function useAppLanguage() {
  const { i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const lang = getLangFromPath(location.pathname)

  // Sync i18next + <html> attributes whenever URL lang changes
  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr'
    // Mirror to the widget's expected localStorage key
    localStorage.setItem('sophyia_lang', lang)
    localStorage.setItem('dinedit_lang', lang)
  }, [lang, i18n])

  const setLang = (newLang: Language) => {
    if (newLang === lang) return
    navigate(buildPathWithLang(location.pathname, newLang))
  }

  return {
    lang,
    setLang,
    supportedLangs: siteConfig.languages.supported,
    isRtl: isRtl(lang),
  }
}

// Sentinel component: place once inside Router to enable the side effects.
export function AppLanguageSync({ children }: { children: ReactNode }) {
  useAppLanguage()
  return <>{children}</>
}
