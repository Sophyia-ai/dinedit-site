// ─────────────────────────────────────────────────────────────────────────────
// AnaisBubble.tsx — Sophyia widget loader pour Dinédit (tenant: dinedit)
// Pattern identique à OliviaBubble (Villa) — copie générique du chassis.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { siteConfig } from '../config/site'
import { useAppLanguage } from '../context/LanguageContext'

const SCRIPT_ID = 'sophyia-widget-script'
const STYLE_ID  = 'sophyia-widget-dinedit-style'
const WIDGET_IDS = ['sophyia-chat-widget', 'sophyia-chat-bubble', 'sophyia-chat-window']

// CSS local injecté une fois — donne à la bulle Anaïs un léger contraste
// (opacité 90 % + backdrop-blur) pour adoucir le bloc or plein.
// N'affecte que Dinédit — les autres clients (Villa, La Gare) ne chargent
// pas ce stylesheet.
const DINEDIT_BUBBLE_CSS = `
  #sophyia-chat-bubble {
    opacity: 0.92 !important;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    transition: opacity 0.35s ease, transform 0.3s ease, box-shadow 0.3s ease !important;
  }
  #sophyia-chat-bubble:hover {
    opacity: 1 !important;
  }
`

function ensureDineditStyle() {
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = DINEDIT_BUBBLE_CSS
  document.head.appendChild(el)
}

export default function AnaisBubble() {
  const { lang } = useAppLanguage()

  useEffect(() => {
    ensureDineditStyle()

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
    // Ouverture douce du panneau chat : 2000ms, cohérent avec l'ADN Dinédit
    // "l'alchimie qui se dévoile". Défaut widget 300ms pour La Gare.
    script.setAttribute('data-open-duration-ms', '2000')
    script.setAttribute('data-active-lang', lang)
    document.body.appendChild(script)
  }, [lang])

  return null
}
