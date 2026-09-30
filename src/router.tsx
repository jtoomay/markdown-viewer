import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { Layout } from './components/Layout'
import { EditorPage } from './routes/EditorPage'
import { ViewerPage } from './routes/ViewerPage'

interface DocSearch {
  doc?: string
}

const validateSearch = (s: Record<string, unknown>): DocSearch => ({
  doc: typeof s.doc === 'string' ? s.doc : undefined,
})

const rootRoute = createRootRoute({ component: Layout })

export const viewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch,
  component: ViewerPage,
})

export const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor',
  validateSearch,
  component: EditorPage,
})

const routeTree = rootRoute.addChildren([viewerRoute, editorRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
