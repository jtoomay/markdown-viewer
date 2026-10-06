import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { Layout } from './components/Layout'
import { EditorPage } from './routes/EditorPage'
import { ReaderPage } from './routes/ReaderPage'
import { ViewerPage } from './routes/ViewerPage'

interface DocSearch {
  doc?: string
}

const validateSearch = (s: Record<string, unknown>): DocSearch => ({
  doc: typeof s.doc === 'string' ? s.doc : undefined,
})

const rootRoute = createRootRoute({ component: Outlet })

// Pathless layout route: its children get the app chrome (header + saved-docs sidebar).
// The reader route is a sibling so it can render edge to edge with no chrome.
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: Layout,
})

export const viewerRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  validateSearch,
  component: ViewerPage,
})

export const editorRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/editor',
  validateSearch,
  component: EditorPage,
})

export const readerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/read',
  validateSearch,
  component: ReaderPage,
})

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([viewerRoute, editorRoute]),
  readerRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
