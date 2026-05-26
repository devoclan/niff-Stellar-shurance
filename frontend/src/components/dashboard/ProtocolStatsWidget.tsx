'use client'

import { useQuery } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { fetchProtocolStats } from '@/lib/api/protocol-stats'

const REFRESH_MS = 30_000

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

export function ProtocolStatsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['protocol-stats'],
    queryFn: fetchProtocolStats,
    refetchInterval: REFRESH_MS,
  })

  if (isLoading) {
    return (
      <section aria-label="Protocol statistics" aria-busy="true">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Protocol statistics are temporarily unavailable.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section aria-label="Protocol statistics">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Protocol Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatItem label="Active policies" value={String(data.totalActivePolicies)} />
            <StatItem label="Open claims" value={String(data.openClaimsCount)} />
            <StatItem label="Quorum progress" value={`${data.quorumProgressPct}%`} />
            <StatItem label="Indexer lag" value={`${data.indexerLagLedgers} ledgers`} />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

/** Exported for tests — loading skeleton layout */
export function ProtocolStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="protocol-stats-skeleton">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
