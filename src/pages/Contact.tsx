// ─────────────────────────────────────────────────────────────────────────────
// Contact.tsx — canaux directs + formulaire (brief §5/§9).
// Interim : le formulaire ouvre le client mail avec un message pré-rempli
// (mailto). Backend d'envoi = étape ultérieure (§9). Jamais de paiement ici.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Instagram } from 'lucide-react'

import { siteConfig } from '../config/site'

export default function Contact() {
  const { t } = useTranslation('pages')
  const email = siteConfig.brand.email

  const subjects = t('contact.form.subjects', { returnObjects: true }) as Record<string, string>
  const subjectKeys = Object.keys(subjects)

  const [form, setForm] = useState({ name: '', email: '', subject: subjectKeys[0] ?? '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subjectLabel = subjects[form.subject] ?? form.subject
    const body = `${form.message}\n\n— ${form.name} (${form.email})`
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`[Dinédit] ${subjectLabel}`)}&body=${encodeURIComponent(body)}`
  }

  const field = 'w-full rounded-xl border border-nuit/15 bg-white px-4 py-3 text-sm text-nuit placeholder-nuit/40 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors'

  return (
    <div className="pb-24">
      <header className="text-center max-w-2xl mx-auto pt-8 pb-14">
        <h1 className="font-display text-4xl md:text-5xl text-nuit">{t('contact.hero.title')}</h1>
        <p className="mt-5 text-lg text-nuit/70 leading-relaxed">{t('contact.hero.subtitle')}</p>
      </header>

      <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 max-w-4xl mx-auto">
        {/* Canaux directs */}
        <div className="space-y-5">
          <a href={`mailto:${email}`} className="flex items-center gap-3 rounded-xl border border-nuit/10 bg-white p-4 hover:border-gold transition-colors group">
            <span className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
              <Mail className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-wider text-nuit/50">{t('contact.channels.emailLabel')}</span>
              <span className="text-sm text-nuit group-hover:text-gold transition-colors">{email}</span>
            </span>
          </a>
          {siteConfig.social.instagram && (
            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-nuit/10 bg-white p-4 hover:border-gold transition-colors group">
              <span className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wider text-nuit/50">{t('contact.channels.instagramLabel')}</span>
                <span className="text-sm text-nuit group-hover:text-gold transition-colors">{t('contact.channels.instagramHandle')}</span>
              </span>
            </a>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" required placeholder={t('contact.form.name')}
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className={field}
          />
          <input
            type="email" required placeholder={t('contact.form.email')}
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            className={field}
          />
          <select
            value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
            className={field} aria-label={t('contact.form.subject')}
          >
            {subjectKeys.map(k => <option key={k} value={k}>{subjects[k]}</option>)}
          </select>
          <textarea
            required rows={5} placeholder={t('contact.form.message')}
            value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
            className={`${field} resize-y`}
          />
          <button type="submit" className="px-8 py-3 rounded-full bg-gold text-nuit font-medium tracking-wide hover:bg-gold-dark transition-colors">
            {t('contact.form.submit')}
          </button>
          <p className="text-xs text-nuit/45">{t('contact.form.note')}</p>
        </form>
      </div>
    </div>
  )
}
