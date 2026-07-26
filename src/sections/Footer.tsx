// ─────────────────────────────────────────────────────────────────────────────
// Footer.tsx — Dinédit (fond blanc, encre nuit, accent or)
// ─────────────────────────────────────────────────────────────────────────────

import { Instagram, Mail, MapPin, Facebook } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'
import BrandLogo from '../components/BrandLogo'
import ObfuscatedEmail from '../components/ObfuscatedEmail'

export default function Footer() {
  const { t } = useTranslation('common')
  const { lang } = useAppLanguage()
  const prefix = lang === siteConfig.languages.default ? '' : `/${lang}`

  const openLegal = (kind: 'mentions' | 'privacy' | 'cgu') => {
    window.dispatchEvent(new CustomEvent('open-legal', { detail: kind }))
  }

  const city = t('common.city')
  const country = t('common.country')

  return (
    <footer className="bg-bone text-nuit border-t border-nuit/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <BrandLogo className="h-12 mb-4" tone="nuit" label={siteConfig.brand.name} />
            <p className="text-xs uppercase tracking-[0.25em] text-gold">{t('footer.tagline')}</p>
            <p className="mt-2 text-sm text-nuit/60">{t('footer.founded')}</p>
            <div className="flex gap-3 mt-4">
              {siteConfig.social.instagram && (
                <a
                  href={siteConfig.social.instagram}
                  target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold hover:text-bone transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {siteConfig.social.facebook && (
                <a
                  href={siteConfig.social.facebook}
                  target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold hover:text-bone transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-nuit uppercase tracking-wider mb-3">{t('footer.contact')}</h4>
            <div className="space-y-2 text-sm">
              <span className="flex items-center gap-2 text-nuit/70">
                <Mail className="w-4 h-4 shrink-0" />
                <ObfuscatedEmail className="hover:text-gold transition-colors cursor-pointer text-left" />
              </span>
              <div className="flex items-center gap-2 text-nuit/70">
                <MapPin className="w-4 h-4" /> {city}, {country}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-nuit uppercase tracking-wider mb-3">Navigation</h4>
            <div className="space-y-2 text-sm">
              <Link to={`${prefix}/agenda`} className="block text-nuit/70 hover:text-gold transition-colors">
                {t('nav.diners')}
              </Link>
              <Link to={`${prefix}/a-propos`} className="block text-nuit/70 hover:text-gold transition-colors">
                {t('nav.apropos')}
              </Link>
              <Link to={`${prefix}/faq`} className="block text-nuit/70 hover:text-gold transition-colors">
                {t('nav.faq')}
              </Link>
              <button onClick={() => openLegal('mentions')} className="block text-nuit/70 hover:text-gold transition-colors text-left">
                {t('footer.mentions')}
              </button>
              <button onClick={() => openLegal('privacy')} className="block text-nuit/70 hover:text-gold transition-colors text-left">
                {t('footer.privacy')}
              </button>
              <button onClick={() => openLegal('cgu')} className="block text-nuit/70 hover:text-gold transition-colors text-left">
                {t('footer.cgu')}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-nuit/10 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-nuit/50">
          <span>© {new Date().getFullYear()} {siteConfig.brand.name}. {t('footer.rights')}.</span>
          <span className="hidden sm:inline text-nuit/30">·</span>
          <p className="text-center sm:text-start">
            Conception by{' '}
            <a href="https://raoulbaudlez.com" target="_blank" rel="noopener noreferrer"
               className="text-nuit/70 hover:text-gold transition-colors">
              Raoul Baudlez
            </a>
            {' & '}
            <a href="https://sophyia.io" target="_blank" rel="noopener noreferrer"
               className="text-gold hover:text-gold-light transition-colors">
              Sophyia.io<sup className="text-[0.7em]">®</sup>
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
