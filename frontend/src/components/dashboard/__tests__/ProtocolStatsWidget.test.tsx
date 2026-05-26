/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ProtocolStatsWidget } from '../ProtocolStatsWidget'
import * as protocolStatsApi from '@/lib/api/protocol-stats'

jest.mock('@/lib/api/protocol-stats')

const mockFetch = protocolStatsApi.fetchProtocolStats as jest.MockedFunction<
  typeof protocolStatsApi.fetchProtocolStats
>

const STATS: protocolStatsApi.ProtocolStats = {
  totalActivePolicies: 128,
  openClaimsCount: 7,
  quorumProgressPct: 62,
  indexerLagLedgers: 2,
}

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

beforeEach(() => {
  jest.useFakeTimers()
  mockFetch.mockReset()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('ProtocolStatsWidget', () => {
  it('renders stats correctly with mocked API data', async () => {
    mockFetch.mockResolvedValue(STATS)

    renderWithClient(<ProtocolStatsWidget />)

    await waitFor(() => {
      expect(screen.getByText('128')).toBeInTheDocument()
    })
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('62%')).toBeInTheDocument()
    expect(screen.getByText('2 ledgers')).toBeInTheDocument()
  })

  it('renders loading skeleton during initial fetch', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))

    renderWithClient(<ProtocolStatsWidget />)

    expect(screen.getByLabelText('Protocol statistics')).toHaveAttribute('aria-busy', 'true')
  })

  it('auto-refresh triggers a re-fetch without unmounting', async () => {
    mockFetch.mockResolvedValue(STATS)

    renderWithClient(<ProtocolStatsWidget />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    jest.advanceTimersByTime(30_000)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByText('128')).toBeInTheDocument()
  })
})
