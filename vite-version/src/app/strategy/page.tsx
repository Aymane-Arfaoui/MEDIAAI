"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Target, 
  Lightbulb, 
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Sparkles,
  Loader2
} from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client/client"
import { useApp } from "@/lib/context/app-context"
import { useToast } from "@/hooks/use-toast"

export default function StrategyPage() {
  const { creatorId } = useApp()
  const { toast } = useToast()
  const [strategy, setStrategy] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await api.generateStrategy(creatorId)
      setStrategy(result.strategy)
      toast({
        title: "Strategy Generated",
        description: "Your content strategy has been created",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate strategy",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  if (!strategy) {
    return (
      <BaseLayout title="Content Strategy" description="AI-generated strategic guidance for creator content">
        <div className="@container/main px-4 lg:px-6 space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">No Strategy Generated Yet</CardTitle>
                  <CardDescription className="text-base">
                    Generate your AI-powered content strategy
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="gap-2" onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Generating Strategy...</>
                ) : (
                  <><Sparkles className="h-5 w-5" /> Generate Strategy</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </BaseLayout>
    )
  }

  const pillars = strategy.contentPillars || []
  const painPoints = strategy.audiencePainPoints || []
  const angles = strategy.messagingAngles || []
  const toneDoList = strategy.toneGuidance?.do || []
  const toneDontList = strategy.toneGuidance?.dont || []
  const whatsWorking = strategy.whatsWorking || []
  const underperforming = strategy.underperforming || []
  const opportunities = strategy.opportunities || []
  const cautions = strategy.cautions || []

  return (
    <BaseLayout 
      title="Content Strategy" 
      description="AI-generated strategic guidance for creator content"
    >
      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* Strategy Overview */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Strategic Framework</CardTitle>
                  <CardDescription className="text-base">
                    Data-driven content strategy for Kristina Subbotina / Lexsy
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4 text-primary" />
                  Content Pillars
                </div>
                <div className="text-3xl font-bold">{pillars.length}</div>
                <p className="text-sm text-muted-foreground">Core themes driving content</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  Pain Points
                </div>
                <div className="text-3xl font-bold">{painPoints.length}</div>
                <p className="text-sm text-muted-foreground">Audience challenges identified</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Messaging Angles
                </div>
                <div className="text-3xl font-bold">{angles.length}</div>
                <p className="text-sm text-muted-foreground">Strategic approaches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Working / Underperforming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                What's Working
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {whatsWorking.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                Underperforming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {underperforming.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Content Pillars */}
        {pillars.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Content Pillars
              </CardTitle>
              <CardDescription>Core themes that structure your content strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pillars.map((pillar: any, index: number) => (
                  <div key={index} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold">{pillar.name}</h3>
                          <p className="text-sm text-muted-foreground">{pillar.description}</p>
                        </div>
                        <Badge variant="outline">Pillar {index + 1}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 p-4 rounded-lg border bg-card">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          Key Messages
                        </div>
                        <ul className="space-y-2">
                          {(pillar.keyMessages || []).map((msg: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                              <span>{msg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3 p-4 rounded-lg border bg-card">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Content Opportunities
                        </div>
                        <ul className="space-y-2">
                          {(pillar.contentOpportunities || []).map((opp: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                              <span>{opp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {index < pillars.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pain Points */}
        {painPoints.length > 0 && (
          <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <Users className="h-5 w-5" />
                Audience Pain Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {painPoints.map((pain: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{pain}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messaging Angles */}
        {angles.length > 0 && (
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-500">
                <MessageSquare className="h-5 w-5" />
                Messaging Angles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {angles.map((angle: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{angle}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tone Guidance */}
        {(toneDoList.length > 0 || toneDontList.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Tone: Do
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {toneDoList.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <XCircle className="h-5 w-5" />
                  Tone: Don't
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {toneDontList.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Opportunities & Cautions */}
        {(opportunities.length > 0 || cautions.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {opportunities.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Cautions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {cautions.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </BaseLayout>
  )
}
