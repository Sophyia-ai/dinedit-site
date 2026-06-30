// ─────────────────────────────────────────────────────────────────────────────
// Navigation.tsx — Dinédit top nav (3 rubrics)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'
import LanguagePill from './LanguagePill'

export default function Navigation() {
  const { t } = useTranslation('common')
  const { lang } = useAppLanguage()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`
  const homeHref = prefix || '/'

  const navItems = [
    { label: t('nav.home'),         href: homeHref },
    { label: t('nav.agenda'),       href: `${prefix}/agenda`, accent: true },
    { label: t('nav.architectes'),  href: `${prefix}/architectes` },
  ]

  const isActive = (href: string) => {
    if (href === homeHref) return location.pathname === homeHref
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-bone/95 backdrop-blur-md border-b border-nuit/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to={homeHref} className="shrink-0" aria-label={siteConfig.brand.name}>
            <img src={siteConfig.brand.logoPath} alt={siteConfig.brand.name} className="h-9 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isActive(item.href)
                    ? 'text-gold'
                    : item.accent
                      ? 'text-gold hover:text-gold-dark'
                      : 'text-nuit/70 hover:text-nuit'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <LanguagePill variant="inline" />
          </div>

          <button
            onClick={() => setIsMobileOpen(o => !o)}
            className="lg:hidden p-2 text-nuit hover:text-gold transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileOpen ? 'max-h-[600px] mt-3' : 'max-h-0'}`}>
          <div className="rounded-2xl bg-bone/95 border border-nuit/10 p-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`block px-3 py-2 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-gold/10 text-gold'
                    : 'text-nuit/70 hover:text-nuit hover:bg-nuit/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 flex">
              <LanguagePill variant="inline" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
