// ─────────────────────────────────────────────────────────────────────────────
// Layout.tsx — chassis layout for content routes (Journal, Booking)
// Home stays immersive and does NOT use this layout.
// ─────────────────────────────────────────────────────────────────────────────

import { Outlet } from 'react-router-dom'
import Footer from '../sections/Footer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-bone text-nuit">
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
