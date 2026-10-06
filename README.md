# Markdown Viewer

Write markdown, read it rendered, or edit it WYSIWYG — one document, one container, one surface
at a time.

## The workspace

A single panel holds everything, and the switch in its header decides which surface is mounted:

| Mode | Surface |
| --- | --- |
| **Text** | The raw markdown in a plain textarea |
| **Markdown** | The rendered document, read only |
| **Editor** | A rich-text editor that reads and writes the same markdown |

Only one is ever mounted — leaving a mode unmounts it, so switching to Markdown *is* the render.
`Ctrl`/`⌘ + Enter` jumps between Text and Markdown.

The markdown string is the single source of truth. The rich editor is seeded from it on mount and
writes back as you type, so nothing needs to be applied or synced by hand. One consequence worth
knowing: the editor normalizes markdown on the way out (`*` bullets become `-`, unsupported inline
HTML is dropped), so editing in Editor mode can rewrite hand-authored formatting. Simply viewing a
mode never changes anything.

Task list items (`- [ ] thing`) are checkable in Markdown mode: ticking one rewrites the
`[ ]` in the source, so the change shows up in Text and is kept by Save. The reader at
`/read` shows them read only. A click maps back to the source through the parsed list
item's position rather than by counting checkboxes, so a `- [ ]` inside a fenced code
block can't send the toggle to the wrong line.

Documents are saved to `localStorage` and listed in the History drawer on the left edge.
`⛶ Full screen ↗` saves and opens the document chrome-free at `/read?doc=<id>` in a new tab.

## Development

```sh
npm install
npm run dev     # vite
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

## Template notes

This started from the React + TypeScript + Vite template, which provides a minimal setup to get
React working in Vite with HMR and some Oxlint rules.

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
