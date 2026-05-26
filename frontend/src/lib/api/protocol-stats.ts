import { apiFetch } from '@/lib/api/fetch'
import { getConfig } from '@/config/env'

export interface ProtocolStats {
  totalActivePolicies: number
  openClaimsCount: number
  /** Average quorum progress (0–100) across active open claims */
  quorumProgressPct: number
  indexerLagLedgers: number
}

export async function fetchProtocolStats(): Promise<ProtocolStats> {
  const { apiUrl } = getConfig()
  return apiFetch<ProtocolStats>(`${apiUrl}/api/protocol/stats`)
}
