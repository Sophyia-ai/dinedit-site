// ─────────────────────────────────────────────────────────────────────────────
// Navigation.tsx — Dinédit header global (icône menu + drawer latéral, 5 onglets)
//
// Rendu par Root (routing.tsx) → présent sur TOUTES les pages, home incluse.
// - Menu derrière une icône sur tous les viewports → panneau latéral (droite).
// - LanguagePill + icône compte toujours visibles (hors drawer), états ouvert/fermé.
// - Variant transparent en haut de la home (overlay sur VideoHero), solide au
//   scroll / sur les autres pages (préserve l'immersif).
// - Drawer accessible : Échap, clic overlay, scroll-lock body, focus trap, retour focus.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { Menu, X, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'
import LanguagePill from './LanguagePill'
import BrandLogo from './BrandLogo'

export default function Navigation() {
  const { t } = useTranslation('common')
  const { lang } = useAppLanguage()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`
  const homeHref = prefix || '/'
  const isHome = location.pathname === homeHref
  const solid = !isHome || scrolled || isOpen

  const navItems = [
    { label: t('nav.diners'),      href: `${prefix}/agenda` },
    { label: t('nav.membre'),      href: `${prefix}/devenir-membre` },
    { label: t('nav.entreprises'), href: `${prefix}/entreprises` },
    { label: t('nav.apropos'),     href: `${prefix}/a-propos` },
    { label: t('nav.contact'),     href: `${prefix}/contact` },
  ]

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/')

  // Le header se solidifie au scroll (pertinent surtout sur la home immersive).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Drawer : scroll-lock body + Échap + focus trap + retour focus sur l'icône menu.
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    // Focus le premier élément focusable du panneau à l'ouverture.
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled])',
    )
    firstFocusable?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
      menuBtnRef.current?.focus()
    }
  }, [isOpen])

  // Ferme le drawer à chaque changement de route.
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const iconBtnCls = `p-2 rounded-full transition-colors ${
    solid ? 'text-nuit hover:text-gold' : 'text-bone hover:text-gold'
  }`

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-bone border-b border-nuit/10 shadow-[0_1px_12px_rgba(27,42,74,0.06)]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to={homeHref} className="shrink-0 group" aria-label={siteConfig.brand.name}>
            <BrandLogo className="h-9 md:h-10" tone={solid ? 'nuit' : 'bone'} hoverGold />
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguagePill variant={solid ? 'inline' : 'overlay'} />

            <Link
              to={`${prefix}/devenir-membre`}
              aria-label={t('nav.account')}
              className={iconBtnCls}
            >
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>

            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setIsOpen(o => !o)}
              aria-label={t('nav.menu')}
              aria-expanded={isOpen}
              aria-controls="main-drawer"
              className={iconBtnCls}
            >
              <Menu className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer latéral + overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-nuit/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="main-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            className="absolute top-0 right-0 h-full w-full max-w-sm bg-bone shadow-2xl flex flex-col animate-slide-in-right"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-nuit/10">
              <BrandLogo className="h-8" tone="nuit" label={siteConfig.brand.name} />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t('nav.close')}
                className="p-2 rounded-full text-nuit hover:text-gold transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              <ul className="space-y-1">
                {navItems.map(item => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-3 font-display text-2xl transition-colors ${
                        isActive(item.href) ? 'text-gold' : 'text-nuit hover:text-gold'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
