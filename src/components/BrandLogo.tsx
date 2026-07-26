// ─────────────────────────────────────────────────────────────────────────────
// BrandLogo.tsx — logo Dinédit encré à la demande.
//
// L'asset (logo-dinedit.png) est blanc pur sur transparent → invisible sur fond
// clair. On l'utilise ici comme MASQUE CSS rempli avec la couleur de marque :
//   tone="nuit" (encre) sur fond clair · tone="bone" (blanc) en overlay vidéo.
// Astuce : coloration exacte depuis un seul asset + hover doré possible.
// Ratio natif 290×140 → aspect-[29/14].
// ─────────────────────────────────────────────────────────────────────────────

import { siteConfig } from '../config/site'

interface Props {
  /** classes de dimension/marge, ex. "h-9 md:h-10" */
  className?: string
  /** couleur de remplissage : encre (fond clair) ou blanc (overlay sombre) */
  tone?: 'nuit' | 'bone'
  /** passe au doré au survol d'un parent .group */
  hoverGold?: boolean
  /** si fourni, expose le logo aux lecteurs d'écran ; sinon décoratif */
  label?: string
}

export default function BrandLogo({ className = 'h-9', tone = 'nuit', hoverGold = false, label }: Props) {
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const }

  return (
    <span
      {...a11y}
      className={`inline-block aspect-[29/14] transition-colors ${className} ${
        tone === 'nuit' ? 'bg-nuit' : 'bg-bone'
      } ${hoverGold ? 'group-hover:bg-gold' : ''}`}
      style={{
        WebkitMaskImage: `url(${siteConfig.brand.logoPath})`,
        maskImage: `url(${siteConfig.brand.logoPath})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}
