import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './auth/AuthProvider'
import { SignInPrompt } from './components/SignInPrompt'
import { applyAppearance } from './theme/appearance'
import { ThemeProvider } from './theme/ThemeProvider'
import { defaultPrefs } from './lib/prefs'
import { router } from './router'

// Appearance now lives on the account, which cannot be read synchronously, so
// paint the OS preference first and let the account's prefs replace it.
applyAppearance(defaultPrefs().theme, defaultPrefs().accent)

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
          <SignInPrompt />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
