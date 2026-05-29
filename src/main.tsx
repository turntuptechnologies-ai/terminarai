import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LocaleProvider } from './i18n'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

// import.meta.env.BASE_URL は vite.config.ts の base 設定が反映される
// dev: '/' / prod: '/terminarai/' (末尾スラッシュ込み)。
// BrowserRouter の basename は末尾スラッシュなし推奨なので削ぎ落とす。
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
)
