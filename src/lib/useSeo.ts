// ─────────────────────────────────────────────────────────────────────────────
// useSeo.ts — SEO par page ET par langue, sans dépendance (pas de react-helmet).
//
// Met à jour <title>, meta description, OG/Twitter, <link canonical> et les
// <link hreflang> (fr/en/nl + x-default) à chaque changement de page/langue.
// Complète le sitemap.xml (signal statique) pour l'indexation multilingue.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'

import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'

const SITE = siteConfig.brand.siteUrl.replace(/\/$/, '')
const LANGS = siteConfig.languages.supported
const DEFAULT = siteConfig.languages.default

const OG_LOCALE: Record<string, string> = { fr: 'fr_BE', en: 'en_GB', nl: 'nl_BE' }

function langUrl(path: string, lang: string): string {
  const clean = path === '/' ? '' : path
  return lang === DEFAULT ? `${SITE}${clean || '/'}` : `${SITE}/${lang}${clean}`
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(sel)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (hreflang) el.setAttribute('hreflang', hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

interface SeoInput {
  /** titre de l'onglet/OG (sans le suffixe marque) */
  title: string
  /** meta description */
  description: string
  /** chemin canonique SANS préfixe de langue, ex. '/a-propos' ou '/' */
  path: string
}

export function useSeo({ title, description, path }: SeoInput) {
  const { lang } = useAppLanguage()

  useEffect(() => {
    const fullTitle = path === '/' ? title : `${title} — ${siteConfig.brand.name}`
    document.title = fullTitle

    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', langUrl(path, lang))
    upsertMeta('property', 'og:locale', OG_LOCALE[lang] ?? 'fr_BE')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)

    upsertLink('canonical', langUrl(path, lang))
    LANGS.forEach(l => upsertLink('alternate', langUrl(path, l), l))
    upsertLink('alternate', langUrl(path, DEFAULT), 'x-default')
  }, [title, description, path, lang])
}
