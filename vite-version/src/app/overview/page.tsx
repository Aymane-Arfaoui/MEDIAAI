"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  TrendingUp, 
  Users, 
  Video, 
  Instagram,
  Youtube,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Loader2
} from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client/client"
import { useApp } from "@/lib/context/app-context"

export default function OverviewPage() {
  const { creatorId } = useApp()
  const [creator, setCreator] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creatorRes, analyticsRes] = await Promise.all([
          api.getCreator(creatorId),
          api.getAnalytics(creatorId),
        ])
        setCreator(creatorRes.creator)
        setAnalytics(analyticsRes.analytics)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [creatorId])

  if (loading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BaseLayout>
    )
  }

  if (!creator) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">No creator data found</p>
        </div>
      </BaseLayout>
    )
  }

  const topPerforming = analytics?.topPerforming || []
  const topicDistribution = analytics?.topicDistribution || {}
  const topTopics = Object.keys(topicDistribution).filter(t => t !== 'unknown').slice(0, 6)
  const totalContent = topPerforming.length > 0 
    ? Object.values(topicDistribution as Record<string, any>).reduce((sum: number, t: any) => sum + (t.count || 0), 0)
    : 0

  return (
    <BaseLayout>
      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* Creator Profile Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{creator.name}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {creator.brandName} • {creator.niche} • {creator.audience}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Niche:</span> {creator.niche}
              </div>
              <div className="text-sm">
                <span className="font-medium">Audience:</span> {creator.audience}
              </div>
              {creator.businessGoals && (
                <div className="text-sm">
                  <span className="font-medium">Goals:</span> {creator.businessGoals}
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Top Topics */}
            <div>
              <div className="text-sm font-medium mb-3">Top Content Topics</div>
              <div className="flex flex-wrap gap-2">
                {topTopics.length > 0 ? (
                  topTopics.map((topic: string) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))
                ) : (
                  <>
                    <Badge variant="secondary">Fundraising</Badge>
                    <Badge variant="secondary">Due Diligence</Badge>
                    <Badge variant="secondary">Contracts</Badge>
                    <Badge variant="secondary">Startup Legal</Badge>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Snapshot */}
        {totalContent > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Content</CardDescription>
                <CardTitle className="text-3xl">{totalContent}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  Pieces analyzed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Top Performing</CardDescription>
                <CardTitle className="text-3xl">{topPerforming.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  High performers
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Topics Covered</CardDescription>
                <CardTitle className="text-3xl">{topTopics.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Content themes
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Key Insights Grid */}
        {topTopics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topTopics.slice(0, 4).map((topic: string, idx: number) => {
              const data = topicDistribution[topic] || { count: 0, avgScore: 0 }
              const colors = [
                "from-primary/5 to-primary/0",
                "from-blue-500/5 to-blue-500/0",
                "from-purple-500/5 to-purple-500/0",
                "from-green-500/5 to-green-500/0"
              ]
              return (
                <Card key={topic} className={`bg-gradient-to-br ${colors[idx % 4]}`}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{topic.replace(/-/g, ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">{data.count} pieces</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Avg score: {(data.avgScore * 100).toFixed(1)}
                    </p>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href="/analytics">
                        View Analytics
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with MEDIAAI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <a href="/analytics">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">View Analytics</span>
                  <span className="text-xs text-muted-foreground">See performance insights</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <a href="/strategy">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Generate Strategy</span>
                  <span className="text-xs text-muted-foreground">Create content strategy</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <a href="/planner">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Weekly Planner</span>
                  <span className="text-xs text-muted-foreground">Plan your content</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <a href="/agent">
                  <Lightbulb className="h-5 w-5" />
                  <span className="font-medium">AI Strategist</span>
                  <span className="text-xs text-muted-foreground">Chat with AI</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Strategist Summary */}
        {topPerforming.length > 0 && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>Your best content based on analytics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerforming.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.derivedInsights?.title || "Untitled"}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.topicCluster} · {item.hookType}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">{(item.derivedInsights?.views || 0).toLocaleString()} views</div>
                      <Badge variant="outline" className="text-xs">{item.performanceBucket}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseLayout>
  )
}
