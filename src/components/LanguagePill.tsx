// ─────────────────────────────────────────────────────────────────────────────
// LanguagePill.tsx — chassis-generic language switcher
// ─────────────────────────────────────────────────────────────────────────────

import { useAppLanguage } from '../context/LanguageContext'

interface Props {
  variant?: 'overlay' | 'inline' // overlay = on a dark photo (cream pill), inline = on cream bg
}

export default function LanguagePill({ variant = 'overlay' }: Props) {
  const { lang, setLang, supportedLangs } = useAppLanguage()

  const wrapperClasses =
    variant === 'overlay'
      ? 'rounded-full border border-bone/30 backdrop-blur-md bg-black/10 px-2 py-1'
      : 'rounded-full border border-nuit/15 bg-bone px-2 py-1'

  return (
    <div className={`flex gap-1 ${wrapperClasses}`}>
      {supportedLangs.map(l => {
        const active = lang === l
        const activeStyles =
          variant === 'overlay'
            ? active ? 'bg-bone/90 text-nuit' : 'text-bone/85 hover:text-bone'
            : active ? 'bg-gold text-bone' : 'text-nuit/70 hover:text-nuit'
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2.5 py-1 text-[10px] uppercase tracking-widest rounded-full transition-all ${activeStyles}`}
            aria-label={`Switch language to ${l.toUpperCase()}`}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}
