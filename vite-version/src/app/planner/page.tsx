"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  Youtube,
  Instagram,
  RefreshCw,
  Edit,
  Copy,
  Sparkles,
  ChevronRight,
  List,
  LayoutGrid,
  Loader2
} from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client/client"
import { useApp } from "@/lib/context/app-context"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function PlannerPage() {
  const { creatorId } = useApp()
  const { toast } = useToast()
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [instruction, setInstruction] = useState("")

  useEffect(() => {
    // Try to load existing plan
    loadPlan()
  }, [creatorId])

  const loadPlan = async () => {
    setLoading(true)
    try {
      // For now, we'll just set loading to false since we don't have a "get latest plan" endpoint
      // The user will need to generate a plan first
      setLoading(false)
    } catch (error) {
      console.error("Failed to load plan:", error)
      setLoading(false)
    }
  }

  const handleGeneratePlan = async () => {
    setGenerating(true)
    try {
      const result = await api.generatePlan(creatorId, startDate, instruction || undefined)
      setPlan(result.plan)
      toast({
        title: "Success!",
        description: "Weekly content plan generated",
      })
      setGenerateOpen(false)
      setInstruction("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate plan",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    const lower = platform.toLowerCase()
    return lower === 'youtube' ? 
      <Youtube className="h-4 w-4 text-red-500" /> : 
      <Instagram className="h-4 w-4 text-pink-500" />
  }

  const getPlatformColor = (platform: string) => {
    const lower = platform.toLowerCase()
    return lower === 'youtube' ?
      'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' :
      'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20'
  }

  if (loading) {
    return (
      <BaseLayout title="Weekly Planner" description="AI-generated content calendar for the week">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BaseLayout>
    )
  }

  if (!plan) {
    return (
      <BaseLayout title="Weekly Planner" description="AI-generated content calendar for the week">
        <div className="@container/main px-4 lg:px-6 space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">No Plan Generated Yet</CardTitle>
                  <CardDescription className="text-base">
                    Generate your first weekly content plan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Sparkles className="h-5 w-5" />
                    Generate Weekly Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Weekly Content Plan</DialogTitle>
                    <DialogDescription>
                      Create a 7-day AI-powered content calendar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instruction">Instructions (Optional)</Label>
                      <Textarea
                        id="instruction"
                        placeholder="E.g., Focus on fundraising readiness and due diligence topics"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleGeneratePlan} 
                      disabled={generating}
                      className="w-full"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Plan
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </BaseLayout>
    )
  }

  const days = plan.days || []
  const youtubeCount = days.filter((d: any) => d.platform.toLowerCase() === 'youtube').length
  const instagramCount = days.filter((d: any) => d.platform.toLowerCase() === 'instagram').length

  return (
    <BaseLayout 
      title="Weekly Planner" 
      description="AI-generated content calendar for the week"
    >
      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* Planner Header */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{plan.title || "Weekly Content Plan"}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.summary || `${days.length} pieces of content strategically planned`}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate New Weekly Plan</DialogTitle>
                      <DialogDescription>
                        Create a fresh 7-day content calendar
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instruction">Instructions (Optional)</Label>
                        <Textarea
                          id="instruction"
                          placeholder="E.g., Focus on fundraising readiness and due diligence topics"
                          value={instruction}
                          onChange={(e) => setInstruction(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button 
                        onClick={handleGeneratePlan} 
                        disabled={generating}
                        className="w-full"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Plan
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Content</div>
                <div className="text-2xl font-bold">{days.length} pieces</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">YouTube Videos</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-500" />
                  {youtubeCount}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Instagram Posts</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  {instagramCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4">
              {days.map((day: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{day.day}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getPlatformColor(day.platform)}>
                            <div className="flex items-center gap-1">
                              {getPlatformIcon(day.platform)}
                              {day.platform}
                            </div>
                          </Badge>
                          <Badge variant="secondary">
                            {day.topic}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title & Hook */}
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Title</div>
                        <div className="font-semibold text-lg">{day.title}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Hook</div>
                        <div className="text-sm italic text-muted-foreground">
                          "{day.hook}"
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Script Outline */}
                    {day.scriptOutline && day.scriptOutline.length > 0 && (
                      <>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Script Outline</div>
                          <div className="space-y-1.5">
                            {day.scriptOutline.map((section: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span>{section}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Rationale */}
                    {day.rationale && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          AI Rationale
                        </div>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {day.rationale}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4 mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {days.map((day: any, index: number) => (
                    <div key={index} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold">{day.day}</div>
                            <Badge variant="outline" className={getPlatformColor(day.platform)}>
                              <div className="flex items-center gap-1">
                                {getPlatformIcon(day.platform)}
                                {day.platform}
                              </div>
                            </Badge>
                            <Badge variant="secondary">{day.topic}</Badge>
                          </div>
                          <div>
                            <div className="font-medium">{day.title}</div>
                            <div className="text-sm text-muted-foreground italic mt-1">
                              "{day.hook}"
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </BaseLayout>
  )
}
