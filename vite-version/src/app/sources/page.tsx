"use client"

import { Link } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDataSources } from "@/contexts/data-sources-context"
import { DATA_SOURCE_CONFIGS, type DataSourceKey } from "@/types/data-sources"
import { Mail, Calendar, FileText, Receipt, Building2, ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

const iconMap = {
  Mail,
  Calendar,
  FileText,
  Receipt,
  Building2,
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'connected':
      return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</Badge>
    case 'error':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Error</Badge>
    case 'syncing':
      return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Syncing</Badge>
    default:
      return <Badge variant="outline">Not Connected</Badge>
  }
}

export default function SourcesPage() {
  const { connections } = useDataSources()
  const sourceKeys = Object.keys(DATA_SOURCE_CONFIGS) as DataSourceKey[]

  const connectedCount = sourceKeys.filter(key => connections[key].status === 'connected').length

  return (
    <BaseLayout title="Data Sources" description="Connect your business data to AI CEO">
      <div className="px-4 md:px-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Data Sources</h1>
          <p className="text-muted-foreground">
            Connect your business data sources. AI CEO uses read-only access to analyze your data and generate insights.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{connectedCount} of {sourceKeys.length} connected</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sourceKeys.map((key) => {
            const config = DATA_SOURCE_CONFIGS[key]
            const connection = connections[key]
            const Icon = iconMap[config.icon as keyof typeof iconMap]

            return (
              <Card key={key} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.name}</CardTitle>
                      </div>
                    </div>
                    {getStatusBadge(connection.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {config.description}
                  </CardDescription>
                  
                  {connection.status === 'connected' && connection.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(connection.lastSync).toLocaleString()}
                    </p>
                  )}

                  <Button asChild className="w-full" variant={connection.status === 'connected' ? 'outline' : 'default'}>
                    <Link to={`/sources/${key}`}>
                      {connection.status === 'connected' ? 'Manage' : 'Connect'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Read-only access:</strong> AI CEO never modifies your data</p>
            <p>• <strong>Encrypted connections:</strong> All data transfers are encrypted</p>
            <p>• <strong>On-prem option:</strong> Deploy AI CEO on your own infrastructure</p>
            <p>• <strong>Revoke anytime:</strong> Disconnect sources instantly from this page</p>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
