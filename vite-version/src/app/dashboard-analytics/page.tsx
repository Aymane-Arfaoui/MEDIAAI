"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  Heart,
  MessageCircle,
  Loader2,
  RefreshCw,
  Youtube,
  BarChart3,
  Trophy,
  Zap,
  Target,
} from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client/client"
import { useApp } from "@/lib/context/app-context"
import { useToast } from "@/hooks/use-toast"

export default function DashboardAnalyticsPage() {
  const { creatorId } = useApp()
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

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
      <BaseLayout title="Dashboard" description="Video analytics and performance insights">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BaseLayout>
    )
  }

  const topPerforming = analytics?.topPerforming || []
  const underperforming = analytics?.underperforming || []
  const topicDist = analytics?.topicDistribution || {}
  const hookDist = analytics?.hookDistribution || {}
  const formatDist = analytics?.formatDistribution || {}
  const hasData = topPerforming.length > 0

  const allItems = [...topPerforming, ...underperforming]
  const totalViews = allItems.reduce((s: number, i: any) => s + (i.derivedInsights?.views || 0), 0)
  const totalLikes = allItems.reduce((s: number, i: any) => s + (i.derivedInsights?.likes || 0), 0)
  const totalComments = allItems.reduce((s: number, i: any) => s + (i.derivedInsights?.comments || 0), 0)
  const totalPieces = Object.values(topicDist as Record<string, any>).reduce((s: number, t: any) => s + (t.count || 0), 0)
  const avgEngagement = allItems.length > 0
    ? allItems.reduce((s: number, i: any) => s + (i.engagementProxy || 0), 0) / allItems.length
    : 0

  // Chart data
  const topicChartData = Object.entries(topicDist)
    .filter(([k]) => k !== "unknown")
    .sort(([, a]: any, [, b]: any) => b.count - a.count)
    .slice(0, 8)
    .map(([topic, data]: any) => ({
      topic: topic.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      count: data.count,
    }))

  const hookChartData = Object.entries(hookDist)
    .filter(([k]) => k !== "unknown")
    .sort(([, a]: any, [, b]: any) => b.avgScore - a.avgScore)
    .slice(0, 6)
    .map(([hook, data]: any) => ({
      hook: hook.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      score: Math.round(data.avgScore * 100),
    }))

  const formatChartData = Object.entries(formatDist)
    .sort(([, a]: any, [, b]: any) => b.count - a.count)
    .slice(0, 6)
    .map(([fmt, data]: any) => ({
      format: fmt.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      count: data.count,
    }))

  const bucketCounts = (() => {
    const b: Record<string, number> = { top: 0, strong: 0, average: 0, weak: 0 }
    allItems.forEach((i: any) => { b[i.performanceBucket] = (b[i.performanceBucket] || 0) + 1 })
    return b
  })()

  return (
    <BaseLayout title="Dashboard" description="Video analytics and performance insights">
      <div className="px-4 lg:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1.5">
            <Youtube className="h-3 w-3 text-red-500" />
            {totalPieces} videos analyzed
          </Badge>
          <Button onClick={handleRunAnalytics} disabled={running} variant="outline" className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {running ? "Processing…" : "Refresh Analytics"}
          </Button>
        </div>

        {!hasData ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Analytics Data Yet</h3>
              <p className="text-muted-foreground mb-4">Ingest content first, then run analytics</p>
              <Button onClick={handleRunAnalytics} disabled={running}>Run Analytics</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Eye className="h-4 w-4" /> Total Views
                  </div>
                  <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Heart className="h-4 w-4" /> Total Likes
                  </div>
                  <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MessageCircle className="h-4 w-4" /> Comments
                  </div>
                  <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Zap className="h-4 w-4" /> Avg Engagement
                  </div>
                  <div className="text-2xl font-bold">{(avgEngagement * 100).toFixed(2)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Trophy className="h-4 w-4" /> Top Performers
                  </div>
                  <div className="text-2xl font-bold">{topPerforming.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Buckets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" /> Performance Distribution
                </CardTitle>
                <CardDescription>Content quality breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Top Tier</div>
                    <div className="text-3xl font-bold text-blue-600">{bucketCounts.top}</div>
                    <div className="text-xs text-muted-foreground">Exceptional performers</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Strong</div>
                    <div className="text-3xl font-bold text-cyan-600">{bucketCounts.strong}</div>
                    <div className="text-xs text-muted-foreground">Above average</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Average</div>
                    <div className="text-3xl font-bold text-gray-600">{bucketCounts.average}</div>
                    <div className="text-xs text-muted-foreground">Baseline performance</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Weak</div>
                    <div className="text-3xl font-bold text-orange-600">{bucketCounts.weak}</div>
                    <div className="text-xs text-muted-foreground">Needs improvement</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topics */}
            {topicChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" /> Top Topics
                  </CardTitle>
                  <CardDescription>Most covered content themes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topicChartData.map((item: any, i: number) => {
                      const maxCount = topicChartData[0]?.count || 1
                      const barWidth = Math.max((item.count / maxCount) * 100, 5)
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.topic}</span>
                            <span className="text-muted-foreground">{item.count} videos</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all" 
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hooks */}
            {hookChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" /> Hook Performance
                  </CardTitle>
                  <CardDescription>Best performing hook styles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hookChartData.map((item: any, i: number) => {
                      const maxScore = hookChartData[0]?.score || 1
                      const barWidth = Math.max((item.score / maxScore) * 100, 5)
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.hook}</span>
                            <span className="text-muted-foreground">{item.score}% score</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 rounded-full transition-all" 
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formats */}
            {formatChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Content Formats
                  </CardTitle>
                  <CardDescription>Format distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {formatChartData.map((item: any, i: number) => {
                      const maxCount = formatChartData[0]?.count || 1
                      const barWidth = Math.max((item.count / maxCount) * 100, 5)
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.format}</span>
                            <span className="text-muted-foreground">{item.count} videos</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full transition-all" 
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Videos Detailed List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" /> Top Performing Videos
                </CardTitle>
                <CardDescription>Your best content ranked by performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerforming.slice(0, 10).map((item: any, index: number) => {
                    const views = item.derivedInsights?.views || 0
                    const likes = item.derivedInsights?.likes || 0
                    const comments = item.derivedInsights?.comments || 0
                    const maxViews = topPerforming[0]?.derivedInsights?.views || 1
                    const barWidth = Math.max((views / maxViews) * 100, 3)
                    return (
                      <div key={index}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-muted-foreground w-5">#{index + 1}</span>
                              <span className="text-sm font-medium truncate">
                                {item.derivedInsights?.platform === 'instagram' 
                                  ? (item.derivedInsights?.caption || "No caption")
                                  : (item.derivedInsights?.title || "Untitled")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-7">
                              <Badge variant="outline" className="text-xs">{item.hookType}</Badge>
                              <Badge variant="secondary" className="text-xs">{item.topicCluster}</Badge>
                              <Badge variant={item.performanceBucket === "top" ? "default" : "outline"} className="text-xs">{item.performanceBucket}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                            <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{views.toLocaleString()}</div>
                            <div className="flex items-center gap-1"><Heart className="h-3 w-3" />{likes}</div>
                            <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{comments}</div>
                          </div>
                        </div>
                        <div className="ml-7 mt-2">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${barWidth}%` }} />
                          </div>
                        </div>
                        {index < Math.min(topPerforming.length, 10) - 1 && <Separator className="mt-3" />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Underperforming */}
            {underperforming.length > 0 && (
              <Card className="border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-yellow-600 dark:text-yellow-400">Underperforming Content</CardTitle>
                  <CardDescription>Videos that may need a different approach</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {underperforming.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {item.derivedInsights?.platform === 'instagram' 
                              ? (item.derivedInsights?.caption || "No caption")
                              : (item.derivedInsights?.title || "Untitled")}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{item.hookType}</Badge>
                            <Badge variant="secondary" className="text-xs">{item.topicCluster}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground ml-4">
                          <span>{(item.derivedInsights?.views || 0).toLocaleString()} views</span>
                          <span>{((item.engagementProxy || 0) * 100).toFixed(2)}% eng.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </BaseLayout>
  )
}
