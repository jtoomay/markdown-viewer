/// <reference types="vite/client" />

// Typed so a renamed or missing variable is a compile error rather than
// an `undefined` that only surfaces as a failed request at runtime.
interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  readonly VITE_APPWRITE_DATABASE_ID: string
  readonly VITE_APPWRITE_TABLE_DOCUMENTS: string
  readonly VITE_APPWRITE_BUCKET_AVATARS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
