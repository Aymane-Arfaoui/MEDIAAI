"use client"

import { Link } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useDataSources } from "@/contexts/data-sources-context"
import { DATA_SOURCE_CONFIGS, type DataSourceKey } from "@/types/data-sources"
import { ArrowLeft, CheckCircle2, XCircle, Shield, RefreshCw, Trash2 } from "lucide-react"

interface SourceDetailLayoutProps {
  sourceKey: DataSourceKey
  icon: React.ReactNode
}

export function SourceDetailLayout({ sourceKey, icon }: SourceDetailLayoutProps) {
  const { getConnection, connect, disconnect } = useDataSources()
  const config = DATA_SOURCE_CONFIGS[sourceKey]
  const connection = getConnection(sourceKey)
  const isConnected = connection.status === 'connected'

  const handleConnect = () => {
    connect(sourceKey)
  }

  const handleDisconnect = () => {
    disconnect(sourceKey)
  }

  return (
    <BaseLayout title={config.name} description={`Manage ${config.name} connection`}>
      <div className="px-4 md:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/sources">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{config.name}</h1>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Connection Status
                {isConnected ? (
                  <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <XCircle className="w-3 h-3 mr-1" /> Not Connected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connected at</span>
                      <span>{connection.connectedAt ? new Date(connection.connectedAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last sync</span>
                      <span>{connection.lastSync ? new Date(connection.lastSync).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button variant="destructive" onClick={handleDisconnect}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <Button onClick={handleConnect} className="w-full">
                  Connect {config.name}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>
                AI CEO requests these read-only permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {config.permissions.map((permission, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {permission}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">How AI CEO uses this data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Analyzes patterns to surface important information in your Daily Brief</p>
            <p>• Identifies action items and priorities based on content and context</p>
            <p>• Powers "Ask AI CEO" with knowledge about your business</p>
            <p>• Never shares your data with third parties</p>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
