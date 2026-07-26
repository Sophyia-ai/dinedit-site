// ─────────────────────────────────────────────────────────────────────────────
// ObfuscatedEmail.tsx — e-mail anti-scraping.
//
// L'adresse n'existe PAS dans le HTML rendu tant que l'utilisateur n'a pas
// cliqué : on affiche un masque (••••) et l'e-mail est assemblé en JS, à la
// volée, depuis des fragments. Efficace contre les robots collecteurs d'e-mails.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

interface Props {
  className?: string
  /** libellé masqué affiché avant le clic */
  masked?: string
}

export default function ObfuscatedEmail({ className = '', masked = '••••••@••••••••' }: Props) {
  const [revealed, setRevealed] = useState(false)

  // Fragments : aucune chaîne « info@dinedit.be » contiguë dans le source.
  const user = 'info'
  const host = ['dinedit', 'be'].join('.')
  const email = user + '@' + host

  if (revealed) {
    return (
      <a href={'mailto:' + email} className={className}>
        {email}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className={className}
      title="Cliquez pour afficher l'adresse e-mail"
      aria-label="Cliquez pour afficher l'adresse e-mail"
    >
      {masked}
    </button>
  )
}
