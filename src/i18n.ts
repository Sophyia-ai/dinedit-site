// ─────────────────────────────────────────────────────────────────────────────
// i18n.ts — i18next bootstrap (Dinédit)
//
// 3 langues : FR / EN / NL. Pas de RTL.
// Namespaces : common (UI labels + legal), home, agenda (events), architectes (Serge & Fany).
// ─────────────────────────────────────────────────────────────────────────────

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { siteConfig } from './config/site'

import frCommon       from './locales/fr/common.json'
import frHome         from './locales/fr/home.json'
import frAgenda       from './locales/fr/agenda.json'
import frArchitectes  from './locales/fr/architectes.json'
import frLegal        from './locales/fr/legal.json'

import enCommon       from './locales/en/common.json'
import enHome         from './locales/en/home.json'
import enAgenda       from './locales/en/agenda.json'
import enArchitectes  from './locales/en/architectes.json'
import enLegal        from './locales/en/legal.json'

import nlCommon       from './locales/nl/common.json'
import nlHome         from './locales/nl/home.json'
import nlAgenda       from './locales/nl/agenda.json'
import nlArchitectes  from './locales/nl/architectes.json'
import nlLegal        from './locales/nl/legal.json'

const resources = {
  fr: { common: frCommon, home: frHome, agenda: frAgenda, architectes: frArchitectes, legal: frLegal },
  en: { common: enCommon, home: enHome, agenda: enAgenda, architectes: enArchitectes, legal: enLegal },
  nl: { common: nlCommon, home: nlHome, agenda: nlAgenda, architectes: nlArchitectes, legal: nlLegal },
}

// Pas de RTL pour Dinédit. (Kept the helper signature for the chassis.)
export const RTL_LANGS = new Set<string>()
export const isRtl = (_lang: string) => false

void i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: siteConfig.languages.default,
    defaultNS: 'common',
    ns: ['common', 'home', 'agenda', 'architectes', 'legal'],
    supportedLngs: siteConfig.languages.supported as unknown as string[],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

export default i18n
