import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/context'
import { documentStore } from '../lib/documents'

const KEY = ['documents'] as const

// Keyed by user so one account's cache can never be served to the next one.
const keyFor = (userId: string | undefined) => [...KEY, userId] as const

export function useDocuments() {
  const { user } = useAuth()
  return useQuery({
    queryKey: keyFor(user?.$id),
    queryFn: documentStore.list,
    enabled: !!user,
  })
}

export function useDocument(id: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...keyFor(user?.$id), id],
    queryFn: () => documentStore.get(id!),
    enabled: !!id && !!user,
  })
}

export function useSaveDocument() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (input: { id?: string; markdown: string }) => {
      // Callers gate on the session before offering Save, so reaching here
      // signed out is a bug rather than something to handle in the UI.
      if (!user) throw new Error('Sign in to save documents.')
      return documentStore.save({ ...input, userId: user.$id })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keyFor(user?.$id) }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: documentStore.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: keyFor(user?.$id) }),
  })
}
