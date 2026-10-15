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

## Accounts

The editor works signed out — type, preview, switch modes. **Saving requires an account**, and
everything saved belongs to it: documents, theme, accent, and the default view. Sign-in happens in
a dialog rather than on its own page, so whatever you have typed survives it.

Signed out, there is nowhere to persist to, so a reload starts fresh. The app keeps nothing of its
own in `localStorage`; the only thing stored there is the Appwrite session, which the SDK writes
under `cookieFallback` whenever its session cookie would be third-party — the case on `localhost`
and on any domain other than `*.cloud.appwrite.io`. Attaching a custom domain makes that cookie
first-party and removes even that.

Documents are listed in the History drawer, opened from the hamburger in the header.
`⛶ Full screen ↗` saves and opens the document chrome-free at `/read?doc=<id>` in a new tab — that
tab boots as its own app instance and reads the document by id, so it needs the session too.

## Backend

[Appwrite Cloud](https://cloud.appwrite.io). Client config lives in `.env.local` — copy
`.env.example` and fill it in. Every value there is public and ships in the browser bundle; a
server API key must never go in a `VITE_`-prefixed variable.

```sh
VITE_APPWRITE_ENDPOINT=https://<REGION>.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=markdown-viewer
VITE_APPWRITE_TABLE_DOCUMENTS=documents
VITE_APPWRITE_BUCKET_AVATARS=avatars
```

The schema is in `appwrite.config.json` and can be recreated with the
[Appwrite CLI](https://appwrite.io/docs/tooling/command-line/installation):

```sh
npm install -g appwrite-cli
appwrite login
appwrite client --project-id <PROJECT_ID>
appwrite push tables --all --force
appwrite push buckets --all --force
```

Two resources, both relying on Appwrite's per-row and per-file permissions rather than a
`userId` filter in application code:

| Resource | Shape |
| --- | --- |
| Table `documents` | `title`, `markdown`; row security on, `create("users")`. Each row is written with read/update/delete for its owner only, so `listRows` returns one account's documents and nothing else. |
| Bucket `avatars` | 2 MB, images only, file security on. Avatar files are uploaded with **public read**, because the file URL is fetched by the browser without the SDK's auth headers. |

Appwrite's built-in `$id`, `$createdAt` and `$updatedAt` stand in for three columns, so the table
holds only the two that are genuinely ours.

The host must also have a **Web platform** registered for its hostname, or the browser blocks every
request with CORS. `localhost` is matched on any port.

Avatars are resized in the browser before upload (`src/lib/image.ts`) and read back with
`getFileView`, never `getFilePreview`. Previews are server-side image transformations, which
Appwrite Cloud blocks below its paid plans — that endpoint answers
`storage_image_transformations_blocked` and the image simply fails to load.

So the upload itself is the thumbnail: centre-cropped square, at most 512px, re-encoded as WebP
with a JPEG fallback, honouring EXIF orientation. A 1600×900 PNG goes in at 144 kB and is stored
at about 4 kB, which is what every page load then fetches. Animated GIFs lose their animation,
and an image that cannot be decoded is uploaded unchanged rather than refused.

### Closing an account

Profile settings can delete every saved document and close the account. Appwrite has no client API
for deleting your own user — `account.updateStatus()` blocks it permanently instead — so the
content is deleted and the user record is left blocked and empty. **A blocked account's email can
never be used to sign up again.** Removing the record outright needs a server API key, which
belongs in an Appwrite Function rather than in this bundle.

## Development

```sh
npm install
cp .env.example .env.local   # then fill in the endpoint and project id
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
