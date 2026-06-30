// ─────────────────────────────────────────────────────────────────────────────
// Agenda.tsx — Dinédit
//
// Phase 1 squelette : page liste des events. Le squelette actuel lit la
// constante `EVENTS_PLACEHOLDER` (les 3 fiches qu'on a saisies dans
// events/upcoming/*.json). Phase 2 : les fiches JSON seront servies en
// statique (build-time) via events_engine.py + agenda_data.json.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'

const EVENTS_PLACEHOLDER = [
  {
    slug: '2026-07-25-frederic-chaine-rafael-gouirand',
    flyer: '/images/events/2026-07-25/flyer.jpg',
    date_human_fr: 'Samedi 25 juillet 2026',
    date_human_en: 'Saturday, July 25, 2026',
    date_human_nl: 'Zaterdag 25 juli 2026',
    title_fr: 'Jazz manouche dans les lupins',
    title_en: 'Gypsy jazz in the lupines',
    title_nl: 'Gipsyjazz tussen de lupines',
    excerpt_fr: 'Frédéric Chaine au violon, Rafael Gouirand à la guitare. Une table dans un champ de lupins en pleine floraison.',
    excerpt_en: 'Frédéric Chaine on violin, Rafael Gouirand on guitar. A table set in a field of lupines in full bloom.',
    excerpt_nl: 'Frédéric Chaine op viool, Rafael Gouirand op gitaar. Een tafel in een bloeiend lupineveld.',
  },
  {
    slug: '2026-08-29-the-past-the-present-the-future',
    flyer: '/images/events/2026-08-29/flyer.jpg',
    date_human_fr: 'Samedi 29 août 2026',
    date_human_en: 'Saturday, August 29, 2026',
    date_human_nl: 'Zaterdag 29 augustus 2026',
    title_fr: 'The Past, the Present & the Future',
    title_en: 'The Past, the Present & the Future',
    title_nl: 'The Past, the Present & the Future',
    excerpt_fr: 'Un buste antique qui se fissure et se transforme en pluie d\'or et d\'argent.',
    excerpt_en: 'An ancient bust cracking open into a rain of gold and silver.',
    excerpt_nl: 'Een antieke buste die openbarst in een regen van goud en zilver.',
  },
  {
    slug: '2026-09-25-j-adore-c-est-quoi',
    flyer: '/images/events/2026-09-25/flyer.jpg',
    date_human_fr: 'Vendredi 25 septembre 2026',
    date_human_en: 'Friday, September 25, 2026',
    date_human_nl: 'Vrijdag 25 september 2026',
    title_fr: "J'adore c'est quoi ?",
    title_en: "What does 'I love it' mean?",
    title_nl: "Wat betekent 'ik vind het geweldig'?",
    excerpt_fr: 'Un lotus doré et l\'écho d\'un flacon qu\'on reconnaît sans le nommer. Parfumerie et table dialoguent.',
    excerpt_en: 'A golden lotus and the echo of a flacon you recognise without it being named. Perfumery meets the table.',
    excerpt_nl: 'Een gouden lotus en de echo van een flacon die je herkent zonder dat hij wordt genoemd. Parfumerie ontmoet de tafel.',
  },
]

export default function Agenda() {
  const { t, i18n } = useTranslation(['agenda', 'common'])
  const lang = i18n.language as 'fr' | 'en' | 'nl'

  return (
    <main id="blog" className="bg-bone min-h-screen pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-nuit">{t('agenda:title')}</h1>
          <p className="mt-4 text-nuit/70 max-w-xl mx-auto">{t('agenda:subtitle')}</p>
        </header>

        <div className="flex justify-center gap-2 mb-10">
          {(['upcoming', 'past', 'all'] as const).map(key => (
            <span
              key={key}
              className={`px-4 py-1.5 rounded-full text-sm border ${
                key === 'upcoming'
                  ? 'bg-nuit text-bone border-nuit'
                  : 'bg-bone text-nuit/70 border-nuit/15'
              }`}
            >
              {t(`agenda:filter.${key}`)}
            </span>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENTS_PLACEHOLDER.map(event => {
            const date = event[`date_human_${lang}` as const] ?? event.date_human_fr
            const title = event[`title_${lang}` as const] ?? event.title_fr
            const excerpt = event[`excerpt_${lang}` as const] ?? event.excerpt_fr
            return (
              <article
                key={event.slug}
                className="group rounded-2xl border border-nuit/10 hover:border-gold/60 transition-colors bg-bone overflow-hidden flex flex-col"
              >
                <div className="aspect-[3/4] overflow-hidden bg-nuit/5">
                  <img
                    src={event.flyer}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">{date}</p>
                  <h2 className="font-display text-xl text-nuit leading-tight mb-3">{title}</h2>
                  <p className="text-nuit/70 text-sm leading-relaxed flex-1">{excerpt}</p>
                  <p className="mt-4 text-xs italic text-nuit/50">
                    {t('agenda:card.tba')}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
