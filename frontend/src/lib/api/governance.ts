import { apiFetch } from './fetch'
import { getConfig } from '@/config/env'

function base() {
  return `${getConfig().apiUrl}/api/governance`
}

function authHeaders(jwt: string) {
  return { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }
}

export type ProposalStatus = 'active' | 'passed' | 'rejected' | 'executed'

export interface GovernanceProposal {
  id: string
  title: string
  description: string
  proposer: string
  status: ProposalStatus
  parameter: string
  currentValue: string
  proposedValue: string
  votesFor: number
  votesAgainst: number
  quorumRequired: number
  deadlineLedger: number
  deadlineTime: string
  createdAt: string
}

export interface ProposalsPage {
  proposals: GovernanceProposal[]
  total: number
  nextCursor?: string
}

export interface CreateProposalInput {
  title: string
  description: string
  parameter: string
  proposedValue: string
}

export const governanceApi = {
  listProposals: (params?: { status?: ProposalStatus; cursor?: string; limit?: number }, signal?: AbortSignal) => {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.cursor) q.set('cursor', params.cursor)
    if (params?.limit) q.set('limit', String(params.limit))
    return apiFetch<ProposalsPage>(`${base()}/proposals?${q}`, { signal })
  },

  createProposal: (jwt: string, input: CreateProposalInput) =>
    apiFetch<GovernanceProposal>(`${base()}/proposals`, {
      method: 'POST',
      headers: authHeaders(jwt),
      body: JSON.stringify(input),
    }),
}
