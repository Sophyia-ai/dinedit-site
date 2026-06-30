import { RouterProvider } from 'react-router-dom'

import './i18n' // initialise i18next before anything renders
import { buildRouter } from './routing'

const router = buildRouter()

export default function App() {
  return <RouterProvider router={router} />
}
