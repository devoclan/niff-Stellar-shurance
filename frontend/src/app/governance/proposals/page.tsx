'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Loader2, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/hooks/useAuth'
import { governanceApi, type GovernanceProposal, type ProposalStatus } from '@/lib/api/governance'

function isAdmin(jwt: string | null): boolean {
  if (!jwt) return false
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload?.role === 'admin' || payload?.isAdmin === true
  } catch {
    return false
  }
}

function getStatusVariant(status: ProposalStatus) {
  switch (status) {
    case 'active':
      return 'info'
    case 'passed':
    case 'executed':
      return 'success'
    case 'rejected':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr))
}

function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function GovernanceProposalsPage() {
  const { jwt } = useAuth()
  const admin = isAdmin(jwt)

  const [proposals, setProposals] = useState<GovernanceProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const loadProposals = useCallback((filterStatus: ProposalStatus | 'all') => {
    setLoading(true)
    setError(null)
    const params = filterStatus !== 'all' ? { status: filterStatus } : undefined
    governanceApi.listProposals(params)
      .then((page) => setProposals(page.proposals))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load proposals'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadProposals(statusFilter)
  }, [loadProposals, statusFilter])

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Governance Proposals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Active on-chain governance proposals and voting status.
          </p>
        </div>
        {admin && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Proposal
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by proposal status"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="passed">Passed</option>
            <option value="rejected">Rejected</option>
            <option value="executed">Executed</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="space-y-4" role="status" aria-label="Loading proposals">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium text-sm">Failed to load proposals</p>
            <p className="text-sm mt-0.5">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => loadProposals(statusFilter)}>
              Try again
            </Button>
          </div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <p className="text-4xl" aria-hidden="true">📋</p>
          <h2 className="text-lg font-semibold text-gray-900">No proposals found</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            {statusFilter === 'all'
              ? 'There are no governance proposals yet.'
              : `No ${statusFilter} proposals at this time.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}

      {admin && showCreateDialog && jwt && (
        <CreateProposalDialog
          jwt={jwt}
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onCreated={(p) => {
            setProposals((prev) => [p, ...prev])
            setShowCreateDialog(false)
          }}
        />
      )}
    </main>
  )
}

function ProposalCard({ proposal }: { proposal: GovernanceProposal }) {
  const totalVotes = proposal.votesFor + proposal.votesAgainst
  const forPct = totalVotes > 0 ? Math.round((proposal.votesFor / totalVotes) * 100) : 0
  const quorumReached = totalVotes >= proposal.quorumRequired

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-lg">{proposal.title}</CardTitle>
          <Badge variant={getStatusVariant(proposal.status)}>
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </Badge>
        </div>
        <CardDescription>{proposal.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Parameter</p>
            <p className="text-sm font-medium font-mono">{proposal.parameter}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current → Proposed</p>
            <p className="text-sm font-medium">
              <span className="text-muted-foreground">{proposal.currentValue}</span>
              {' → '}
              <span className="text-primary font-semibold">{proposal.proposedValue}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Proposer</p>
            <p className="text-sm font-medium font-mono" title={proposal.proposer}>
              {truncateAddress(proposal.proposer)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</p>
            <p className="text-sm font-medium">{formatDate(proposal.deadlineTime)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Votes: {proposal.votesFor} for / {proposal.votesAgainst} against
            </span>
            <span className={`text-xs font-medium ${quorumReached ? 'text-green-600' : 'text-muted-foreground'}`}>
              {quorumReached ? 'Quorum reached' : `${totalVotes}/${proposal.quorumRequired} needed`}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${forPct}%` }}
              aria-label={`${forPct}% votes in favor`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateProposalDialog({
  jwt,
  open,
  onClose,
  onCreated,
}: {
  jwt: string
  open: boolean
  onClose: () => void
  onCreated: (p: GovernanceProposal) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [parameter, setParameter] = useState('')
  const [proposedValue, setProposedValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = title.trim() && parameter.trim() && proposedValue.trim() && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const proposal = await governanceApi.createProposal(jwt, {
        title: title.trim(),
        description: description.trim(),
        parameter: parameter.trim(),
        proposedValue: proposedValue.trim(),
      })
      onCreated(proposal)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create proposal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && (v ? undefined : onClose())}>
      <DialogContent aria-labelledby="create-proposal-title" aria-describedby="create-proposal-desc">
        <DialogHeader>
          <DialogTitle id="create-proposal-title">New Parameter Change Proposal</DialogTitle>
          <DialogDescription id="create-proposal-desc">
            Submit a governance proposal to change a protocol parameter. This will be voted on by the community.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proposal-title">Title</Label>
            <Input
              id="proposal-title"
              placeholder="e.g. Increase quorum threshold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proposal-description">Description</Label>
            <textarea
              id="proposal-description"
              placeholder="Explain the rationale for this change…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposal-parameter">Parameter</Label>
              <Input
                id="proposal-parameter"
                placeholder="e.g. quorum_threshold"
                value={parameter}
                onChange={(e) => setParameter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal-value">Proposed Value</Label>
              <Input
                id="proposal-value"
                placeholder="e.g. 75"
                value={proposedValue}
                onChange={(e) => setProposedValue(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} aria-busy={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              'Submit Proposal'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
