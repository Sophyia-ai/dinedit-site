// ─────────────────────────────────────────────────────────────────────────────
// routing.tsx — Dinédit router (FR/EN/NL, no RTL)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'

import { siteConfig } from './config/site'
import { AppLanguageSync } from './context/LanguageContext'
import Layout from './components/Layout'
import Navigation from './components/Navigation'
import AnaisBubble from './components/AnaisBubble'
import CookieBanner from './components/CookieBanner'
import Legal from './sections/Legal'
import Home from './pages/Home'
import Agenda from './pages/Agenda'
import APropos from './pages/APropos'
import DevenirMembre from './pages/DevenirMembre'
import Entreprises from './pages/Entreprises'
import Contact from './pages/Contact'
import Faq from './pages/Faq'

type LegalKind = 'mentions' | 'privacy' | 'cgu'

function Root() {
  const [legalOpen, setLegalOpen] = useState<LegalKind | null>(null)

  useEffect(() => {
    const handler = (e: Event) => setLegalOpen((e as CustomEvent).detail as LegalKind)
    window.addEventListener('open-legal', handler)
    return () => window.removeEventListener('open-legal', handler)
  }, [])

  return (
    <AppLanguageSync>
      <Navigation />
      <Outlet />
      <AnaisBubble />
      <CookieBanner />
      {legalOpen && <Legal type={legalOpen} onClose={() => setLegalOpen(null)} />}
    </AppLanguageSync>
  )
}

export function buildRouter() {
  const { supported, default: dflt } = siteConfig.languages
  const nonDefault = supported.filter(l => l !== dflt)

  const contentRoutes = [
    { path: 'agenda', element: <Agenda /> },
    { path: 'devenir-membre', element: <DevenirMembre /> },
    { path: 'entreprises', element: <Entreprises /> },
    { path: 'a-propos', element: <APropos /> },
    { path: 'contact', element: <Contact /> },
    { path: 'faq', element: <Faq /> },
    // Ancienne route → redirection SPA (le vrai 301 SEO est dans staticwebapp.config.json)
    { path: 'architectes', element: <Navigate to="a-propos" replace /> },
  ]

  return createBrowserRouter([
    {
      element: <Root />,
      children: [
        { path: '/', element: <Home /> },
        ...nonDefault.map(lang => ({ path: `/${lang}`, element: <Home /> })),
        {
          element: <Layout />,
          children: [
            ...contentRoutes,
            ...nonDefault.flatMap(lang =>
              contentRoutes.map(r => ({ ...r, path: `${lang}/${r.path}` })),
            ),
          ],
        },
      ],
    },
  ])
}
