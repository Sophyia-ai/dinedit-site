// ─────────────────────────────────────────────────────────────────────────────
// Logo.tsx — médaillon avec anneau blanc qui déborde du logo rond.
//
// Le logo source est rond + fond crème ; on l'enserre dans un cercle BLANC pur
// qui dépasse légèrement, créant un effet "halo / médaille de luxe". Une
// ombre douce le décolle des fonds sombres (hero) ou clairs (footer).
//
// Props :
//   size : px (24-128). Défaut 64.
//   variant : 'light' (sur fond sombre, halo blanc) | 'dark' (sur fond clair, halo subtil)
// ─────────────────────────────────────────────────────────────────────────────

import { siteConfig } from '../config/site'

type LogoSize = number
type Variant = 'light' | 'dark'

interface Props {
  size?: LogoSize
  variant?: Variant
  className?: string
}

export default function Logo({ size = 64, variant = 'light', className = '' }: Props) {
  const haloPx = Math.max(4, Math.round(size * 0.08)) // ~8% du logo

  const haloClasses =
    variant === 'light'
      ? 'bg-white shadow-[0_4px_18px_rgba(0,0,0,0.18)]'
      : 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]'

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full ${haloClasses} ${className}`}
      style={{ padding: `${haloPx}px` }}
      aria-label={siteConfig.brand.name}
    >
      <img
        src={siteConfig.brand.logoPath}
        alt={siteConfig.brand.name}
        className="block rounded-full select-none"
        style={{ width: size, height: size }}
        draggable={false}
      />
    </div>
  )
}
