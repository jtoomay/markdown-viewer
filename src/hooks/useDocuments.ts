import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentStore } from '../lib/storage'

const KEY = ['documents'] as const

export function useDocuments() {
  return useQuery({ queryKey: KEY, queryFn: documentStore.list })
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => documentStore.get(id!),
    enabled: !!id,
  })
}

export function useSaveDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: documentStore.save,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: documentStore.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
