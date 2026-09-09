import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { opportunitiesApi } from '@/lib/api/opportunities'
import type { OpportunityFilters } from '@/types'

export function useOpportunities(filters?: OpportunityFilters) {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => opportunitiesApi.list(filters),
  })
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => opportunitiesApi.get(id),
    enabled: !!id,
  })
}

export function useRecommendations(limit = 6) {
  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => opportunitiesApi.recommendations(limit),
  })
}

export function useSavedOpportunities() {
  return useQuery({
    queryKey: ['saved-opportunities'],
    queryFn: () => opportunitiesApi.saved(),
  })
}

export function useSaveOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.save(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-opportunities'] }),
  })
}

export function useUnsaveOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.unsave(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-opportunities'] }),
  })
}
