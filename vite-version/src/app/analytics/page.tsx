"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  TrendingUp, 
  Eye,
  Heart,
  Youtube,
  Instagram,
  Sparkles,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client/client"
import { useApp } from "@/lib/context/app-context"
import { useToast } from "@/hooks/use-toast"

export default function AnalyticsPage() {
  const { creatorId } = useApp()
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")

  useEffect(() => {
    loadAnalytics()
  }, [creatorId])

  const loadAnalytics = async () => {
    try {
      const result = await api.getAnalytics(creatorId)
      setAnalytics(result.analytics)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunAnalytics = async () => {
    setRunning(true)
    try {
      const result = await api.runAnalytics(creatorId)
      toast({
        title: "Analytics Complete",
        description: `Processed ${result.processed} content items`,
      })
      await loadAnalytics()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run analytics",
        variant: "destructive",
      })
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return (
      <BaseLayout title="Analytics" description="Executive strategist dashboard for content performance">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BaseLayout>
    )
  }

  const topContent = analytics?.topPerforming || []
  const hookDistribution = analytics?.hookDistribution || {}
  const topicDistribution = analytics?.topicDistribution || {}
  const formatDistribution = analytics?.formatDistribution || {}
  const hasData = topContent.length > 0

  // Filter content by platform
  const filterByPlatform = (items: any[]) => {
    if (selectedPlatform === "all") return items
    return items.filter((item: any) => item.derivedInsights?.platform === selectedPlatform)
  }

  const filteredTopContent = filterByPlatform(topContent)

  // Count platforms
  const platformCounts = topContent.reduce((acc: any, item: any) => {
    const platform = item.derivedInsights?.platform || "unknown"
    acc[platform] = (acc[platform] || 0) + 1
    return acc
  }, {})

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube": return <Youtube className="h-3 w-3 text-red-500" />
      case "instagram": return <Instagram className="h-3 w-3 text-pink-500" />
      default: return null
    }
  }

  return (
    <BaseLayout 
      title="Analytics" 
      description="Executive strategist dashboard for content performance"
    >
      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* Run Analytics Button */}
        <div className="flex items-center justify-between">
          <div />
          <Button onClick={handleRunAnalytics} disabled={running} className="gap-2">
            {running ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Running...</>
            ) : (
              <><RefreshCw className="h-4 w-4" /> Run Analytics</>
            )}
          </Button>
        </div>

        {!hasData ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Analytics Data Yet</h3>
              <p className="text-muted-foreground mb-4">Ingest content first, then run analytics to see insights</p>
              <Button onClick={handleRunAnalytics} disabled={running}>
                {running ? "Running..." : "Run Analytics"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All Platforms ({topContent.length})
              </TabsTrigger>
              <TabsTrigger value="youtube" className="gap-1.5">
                <Youtube className="h-3.5 w-3.5" />
                YouTube ({platformCounts.youtube || 0})
              </TabsTrigger>
              <TabsTrigger value="instagram" className="gap-1.5">
                <Instagram className="h-3.5 w-3.5" />
                Instagram ({platformCounts.instagram || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedPlatform} className="space-y-6 mt-6">
              {/* Top Performing Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>
                    {selectedPlatform === "all" 
                      ? "Highest-scoring content by performance" 
                      : `Highest-scoring ${selectedPlatform} content`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredTopContent.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      No content found for {selectedPlatform === "all" ? "any platform" : selectedPlatform}
                    </div>
                  ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Hook Type</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Bucket</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Engagement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTopContent.map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getPlatformIcon(item.derivedInsights?.platform)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium max-w-sm truncate">
                              {item.derivedInsights?.platform === 'instagram' 
                                ? (item.derivedInsights?.caption || "No caption")
                                : (item.derivedInsights?.title || "Untitled")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.hookType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.topicCluster}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              item.performanceBucket === 'top' ? 'default' :
                              item.performanceBucket === 'strong' ? 'secondary' : 'outline'
                            }>
                              {item.performanceBucket}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Eye className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">
                                {(item.derivedInsights?.views || 0).toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Heart className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">
                                {(item.engagementProxy * 100).toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  )}
                </CardContent>
              </Card>

              {/* Hook Patterns & Topic Clusters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hook Patterns</CardTitle>
                    <CardDescription>Performance by hook type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(hookDistribution)
                        .sort(([, a]: any, [, b]: any) => b.avgScore - a.avgScore)
                        .map(([hook, data]: any, index: number) => (
                        <div key={hook} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium capitalize">{hook.replace(/-/g, ' ')}</div>
                                <Badge variant={
                                  data.avgScore > 0.08 ? 'default' :
                                  data.avgScore > 0.04 ? 'secondary' : 'outline'
                                } className="text-xs">
                                  {data.avgScore > 0.08 ? 'High' :
                                   data.avgScore > 0.04 ? 'Medium' : 'Low'} Performance
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">{data.count} pieces</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {Math.round(data.percentage || 0)}%
                              </div>
                              <div className="text-xs text-muted-foreground">Usage</div>
                            </div>
                          </div>
                          {index < Object.keys(hookDistribution).length - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Topic Clusters</CardTitle>
                    <CardDescription>Performance by content topic</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(topicDistribution)
                        .sort(([, a]: any, [, b]: any) => b.count - a.count)
                        .map(([topic, data]: any, index: number) => (
                        <div key={topic} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium capitalize">{topic.replace(/-/g, ' ')}</div>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {data.count} pieces
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {(data.avgScore * 100).toFixed(1)}
                              </div>
                              <div className="text-xs text-muted-foreground">Avg Score</div>
                            </div>
                          </div>
                          {index < Object.keys(topicDistribution).length - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content Formats */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Formats</CardTitle>
                  <CardDescription>Performance by format type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(formatDistribution)
                      .sort(([, a]: any, [, b]: any) => b.avgScore - a.avgScore)
                      .map(([fmt, data]: any) => (
                      <div key={fmt} className="p-4 rounded-lg border bg-card space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium capitalize">{fmt.replace(/-/g, ' ')}</div>
                          <Badge variant={
                            data.avgScore > 0.08 ? 'default' : 'secondary'
                          } className="text-xs">
                            {data.avgScore > 0.08 ? 'Strong' : 'Average'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{data.count} pieces</div>
                        <div className="text-sm font-medium">
                          Avg score: {(data.avgScore * 100).toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </BaseLayout>
  )
}
