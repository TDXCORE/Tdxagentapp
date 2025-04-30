"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Users, FileText, FileCheck, Clock } from "lucide-react"

interface KPICardsProps {
  stats?: {
    total_leads: number
    qualified_leads: number
    prds_generated: number
    contracts_sent: number
    contracts_signed: number
    conversion_rate: number
    avg_time_to_close: number
  }
}

// Default stats for when none are provided
const defaultStats = {
  total_leads: 120,
  qualified_leads: 78,
  prds_generated: 45,
  contracts_sent: 32,
  contracts_signed: 28,
  conversion_rate: 23,
  avg_time_to_close: 14,
}

export function KPICards({ stats = defaultStats }: KPICardsProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_leads}</div>
          <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 20)}% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.qualified_leads}</div>
          <div className="flex items-center text-xs text-green-500">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            {Math.floor((stats.qualified_leads / stats.total_leads) * 100)}% qualification rate
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">PRDs Generated</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.prds_generated}</div>
          <p className="text-xs text-muted-foreground">
            {Math.floor((stats.prds_generated / stats.qualified_leads) * 100)}% of qualified leads
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contracts Signed</CardTitle>
          <FileCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.contracts_signed}</div>
          <div className="flex items-center text-xs text-green-500">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            {stats.conversion_rate}% conversion rate
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Time to Close</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avg_time_to_close} days</div>
          <p className="text-xs text-muted-foreground">-{Math.floor(Math.random() * 10)}% from last month</p>
        </CardContent>
      </Card>
    </>
  )
}

// Export KpiCards as an alias for KPICards for backward compatibility
export const KpiCards = KPICards
