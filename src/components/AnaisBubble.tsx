// ─────────────────────────────────────────────────────────────────────────────
// AnaisBubble.tsx — Sophyia widget loader pour Dinédit (tenant: dinedit)
// Pattern identique à OliviaBubble (Villa) — copie générique du chassis.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'

const SCRIPT_ID = 'sophyia-widget-script'
const WIDGET_IDS = ['sophyia-chat-widget', 'sophyia-chat-bubble', 'sophyia-chat-window']

export default function AnaisBubble() {
  const { lang } = useAppLanguage()

  useEffect(() => {
    const existing = document.getElementById(SCRIPT_ID)
    if (existing && existing.getAttribute('data-active-lang') === lang) return

    document.getElementById(SCRIPT_ID)?.remove()
    WIDGET_IDS.forEach(id => document.getElementById(id)?.remove())

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = '/widget/widget.js'
    script.setAttribute('data-bot', siteConfig.widget.botId)
    script.setAttribute('data-color', siteConfig.widget.color)
    script.setAttribute('data-mode', siteConfig.widget.mode)
    script.setAttribute('data-api', siteConfig.widget.apiUrl)
    // Anaïs : skip le defaultWelcome neutre, le welcome dynamique 3 langues
    // est composé côté tenant Dinédit.
    script.setAttribute('data-skip-welcome', '')
    script.setAttribute('data-auto-open-ms', '6000')
    script.setAttribute('data-auto-close-ms', '10000')
    script.setAttribute('data-active-lang', lang)
    document.body.appendChild(script)
  }, [lang])

  return null
}
