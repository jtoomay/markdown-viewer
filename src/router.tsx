import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { Layout } from './components/Layout'
import { ReaderPage } from './routes/ReaderPage'
import { WorkspacePage } from './routes/WorkspacePage'

interface DocSearch {
  doc?: string
}

const validateSearch = (s: Record<string, unknown>): DocSearch => ({
  doc: typeof s.doc === 'string' ? s.doc : undefined,
})

const rootRoute = createRootRoute({ component: Outlet })

// Pathless layout route: its children get the app chrome (header + history drawer).
// The reader route is a sibling so it can render edge to edge with no chrome.
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: Layout,
})

export const workspaceRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  validateSearch,
  component: WorkspacePage,
})

// The editor is now a mode of the workspace rather than its own page.
// Kept as a redirect so existing links and bookmarks still land somewhere.
const editorRedirectRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/editor',
  validateSearch,
  beforeLoad: ({ search }) => {
    throw redirect({ to: '/', search, replace: true })
  },
})

export const readerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/read',
  validateSearch,
  component: ReaderPage,
})

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([workspaceRoute, editorRedirectRoute]),
  readerRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
