// ─────────────────────────────────────────────────────────────────────────────
// Faq.tsx — questions fréquentes (brief §5). Accessible via le footer.
// Accordéon natif <details>/<summary> (clavier + a11y sans JS).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { useSeo } from '../lib/useSeo'

export default function Faq() {
  const { t } = useTranslation('pages')
  const items = t('faq.items', { returnObjects: true }) as { q: string; a: string }[]

  useSeo({ title: t('faq.title'), description: t('faq.subtitle'), path: '/faq' })

  // JSON-LD FAQPage (rich results) — mis à jour par langue.
  useEffect(() => {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map(it => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a },
      })),
    }
    let el = document.getElementById('faq-jsonld')
    if (!el) {
      el = document.createElement('script')
      el.id = 'faq-jsonld'
      ;(el as HTMLScriptElement).type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(ld)
    return () => { document.getElementById('faq-jsonld')?.remove() }
  }, [items])

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      <header className="text-center pt-8 pb-12">
        <h1 className="font-display text-4xl md:text-5xl text-nuit">{t('faq.title')}</h1>
        <p className="mt-4 text-nuit/60">{t('faq.subtitle')}</p>
      </header>

      <div className="space-y-3">
        {items.map((item, i) => (
          <details key={i} className="group rounded-2xl border border-nuit/10 bg-white overflow-hidden">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 text-nuit font-medium hover:text-gold transition-colors">
              <span>{item.q}</span>
              <Plus className="w-5 h-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" strokeWidth={1.5} />
            </summary>
            <div className="px-6 pb-5 -mt-1 text-sm text-nuit/70 leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
