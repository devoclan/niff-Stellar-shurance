import Link from 'next/link'

import { ProtocolStatsWidget } from '@/components/dashboard/ProtocolStatsWidget'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Protocol-level metrics refresh automatically every 30 seconds.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/policies">My Policies</Link>
        </Button>
      </div>

      <ProtocolStatsWidget />
    </main>
  )
}
