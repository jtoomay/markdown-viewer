# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Deploying

- Build command: `npm run build`
- Publish directory: `dist`

This is a single-page app, so the host **must** serve `index.html` for paths that don't match a
real file. Without that, client-side routes 404 on direct navigation, refresh, or being opened in
a new tab — which is how the full-screen reader at `/read?doc=<id>` is opened.

`public/_redirects` covers this for Netlify and Cloudflare Pages (Vite copies `public/` into
`dist/`, where both hosts look for the file). The rule must be status `200` — a `301`/`302` would
redirect to `/` and discard the `?doc=` query string.

Other hosts need their own equivalent:

| Host | Rule |
| --- | --- |
| Vercel | `vercel.json` → `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` |
| nginx | `try_files $uri $uri/ /index.html;` |
| GitHub Pages | No rewrite support — copy `dist/index.html` to `dist/404.html`, and set `base` in `vite.config.ts` if served from a subpath |

No config is needed for local work: `vite` and `vite preview` both do this fallback already.
