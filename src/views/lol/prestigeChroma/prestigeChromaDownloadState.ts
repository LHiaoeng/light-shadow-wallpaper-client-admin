import type { PrestigeChromaPageParam, PrestigeChromaQO } from '@/api/lol/prestigeChroma/types'

export const snapshotPrestigeChromaQuery = (query: PrestigeChromaQO): PrestigeChromaQO => ({
  ...query
})

export const buildPrestigeChromaCountPageParam = (
  query: PrestigeChromaQO
): PrestigeChromaPageParam => ({
  ...snapshotPrestigeChromaQuery(query),
  current: 1,
  size: 1
})
