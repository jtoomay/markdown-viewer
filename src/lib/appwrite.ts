// The single Appwrite client. Everything that talks to the backend imports
// its service from here, so there is one place that knows the endpoint.

import { Account, Client, Storage, TablesDB } from 'appwrite'

function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  // A missing variable otherwise fails much later as an opaque network error,
  // so say which one is missing while the stack trace still points here.
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env.local and fill it in.`)
  return value
}

export const client = new Client()
  .setEndpoint(required('VITE_APPWRITE_ENDPOINT'))
  .setProject(required('VITE_APPWRITE_PROJECT_ID'))

export const account = new Account(client)
export const tablesDB = new TablesDB(client)
export const storage = new Storage(client)
