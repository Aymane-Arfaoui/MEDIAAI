"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Eye,
  Heart,
  MessageCircle,
  Loader2,
  Sparkles,
  Download,
  Wand2,
  Film,
  Mic,
  Play,
  Trophy,
  Zap,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { useState, useRef } from "react"
import { api } from "@/lib/api-client/client"
import { useApp } from "@/lib/context/app-context"
import { useToast } from "@/hooks/use-toast"

type Step = "idle" | "selecting" | "selected" | "analyzing" | "analyzed" | "generating" | "generated"

export default function RepurposePage() {
  const { creatorId } = useApp()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>("idle")
  const [videos, setVideos] = useState<any[]>([])
  const [analyses, setAnalyses] = useState<Record<string, any>>({})
  const [plans, setPlans] = useState<Record<string, any>>({})
  const [downloading, setDownloading] = useState<Record<string, boolean>>({})
  const [rendering, setRendering] = useState<Record<string, boolean>>({})
  const [voiceovering, setVoiceovering] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [renderedUrls, setRenderedUrls] = useState<Record<string, string>>({})
  const [voiceoverUrls, setVoiceoverUrls] = useState<Record<string, string>>({})
  const [processingStep, setProcessingStep] = useState<Record<string, string>>({})
  const videoRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleSelectTopVideos = async () => {
    setStep("selecting")
    try {
      const result = await api.selectTopVideos(creatorId, 2)
      setVideos(result.videos)
      setStep("selected")
    } catch (error) {
      toast({ title: "Error", description: "Failed to select top videos", variant: "destructive" })
      setStep("idle")
    }
  }

  const handleAnalyzeAll = async () => {
    setStep("analyzing")
    try {
      const newAnalyses: Record<string, any> = {}
      for (const video of videos) {
        const result = await api.analyzeForRepurpose(creatorId, video)
        newAnalyses[video.contentItemId] = result.analysis
      }
      setAnalyses(newAnalyses)
      setStep("analyzed")
    } catch (error) {
      toast({ title: "Error", description: "Failed to analyze videos", variant: "destructive" })
      setStep("selected")
    }
  }

  const handleGenerateAll = async () => {
    setStep("generating")
    try {
      const newPlans: Record<string, any> = {}
      for (const video of videos) {
        const analysis = analyses[video.contentItemId]
        if (!analysis) continue
        const result = await api.generateRepurposePlan(creatorId, video, analysis)
        newPlans[video.contentItemId] = result.plan
      }
      setPlans(newPlans)
      setStep("generated")
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate plans", variant: "destructive" })
      setStep("analyzed")
    }
  }

  const handleDownload = async (video: any) => {
    setDownloading((p) => ({ ...p, [video.contentItemId]: true }))
    try {
      await api.downloadVideo(video.contentItemId, video.url)
      const url = api.getDownloadFileUrl(`${video.contentItemId}.mp4`)
      const a = document.createElement("a")
      a.href = url
      a.download = `${(video.title || "video").slice(0, 40)}.mp4`
      a.click()
      toast({ title: "Downloaded", description: "Video saved" })
    } catch (error) {
      toast({ title: "Error", description: "Download failed", variant: "destructive" })
    } finally {
      setDownloading((p) => ({ ...p, [video.contentItemId]: false }))
    }
  }

  const handleRender = async (video: any) => {
    const plan = plans[video.contentItemId]
    if (!plan) return
    const id = video.contentItemId
    setRendering((p) => ({ ...p, [id]: true }))
    try {
      setProcessingStep((p) => ({ ...p, [id]: "Downloading video..." }))
      await api.downloadVideo(id, video.url)

      setProcessingStep((p) => ({ ...p, [id]: "Rendering title overlay..." }))
      const result = await api.renderOverlay(
        id,
        plan.hookOptions?.[0],
        plan.onScreenHeadline,
      )
      const url = api.getDownloadFileUrl(result.rendered.fileName)
      setRenderedUrls((p) => ({ ...p, [id]: url }))
      toast({ title: "Rendered!", description: "Repurposed video ready — scroll down to preview" })

      setTimeout(() => {
        videoRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 200)
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Render failed", variant: "destructive" })
    } finally {
      setRendering((p) => ({ ...p, [id]: false }))
      setProcessingStep((p) => { const n = { ...p }; delete n[id]; return n })
    }
  }

  const handleVoiceover = async (video: any) => {
    const plan = plans[video.contentItemId]
    if (!plan?.rewrittenScript) return
    const id = video.contentItemId
    setVoiceovering((p) => ({ ...p, [id]: true }))
    try {
      setProcessingStep((p) => ({ ...p, [id]: "Downloading video..." }))
      await api.downloadVideo(id, video.url)

      setProcessingStep((p) => ({ ...p, [id]: "Generating AI voiceover..." }))
      const result = await api.generateVoiceover(id, plan.rewrittenScript, true)
      const url = api.getDownloadFileUrl(result.asset.fileName)
      setVoiceoverUrls((p) => ({ ...p, [id]: url }))
      toast({ title: "Voiceover ready!", description: "Video with AI voice — scroll down to preview" })

      setTimeout(() => {
        videoRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 200)
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Voiceover failed", variant: "destructive" })
    } finally {
      setVoiceovering((p) => ({ ...p, [id]: false }))
      setProcessingStep((p) => { const n = { ...p }; delete n[id]; return n })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const isLoading = step === "selecting" || step === "analyzing" || step === "generating"

  return (
    <BaseLayout title="Repurpose Viral Shorts" description="Turn your best-performing content into new short-form assets">
      <div className="px-4 lg:px-6 space-y-6">
        {/* Hero Action */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Content Repurposing
                </h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  MEDIAAI identifies your best-performing YouTube Shorts and instantly turns them into new reusable short-form assets with AI-generated titles, hooks, scripts, and overlays.
                </p>
              </div>
              {step === "idle" && (
                <Button onClick={handleSelectTopVideos} className="gap-2 shrink-0">
                  <Trophy className="h-4 w-4" />
                  Select Top 2 Viral Shorts
                </Button>
              )}
              {step !== "idle" && (
                <Button variant="outline" onClick={() => { setStep("idle"); setVideos([]); setAnalyses({}); setPlans({}); setRenderedUrls({}); setVoiceoverUrls({}) }} className="gap-2 shrink-0">
                  <RefreshCw className="h-4 w-4" /> Start Over
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-1">
                {step === "selecting" && "Finding your top viral shorts..."}
                {step === "analyzing" && "Analyzing why these videos went viral..."}
                {step === "generating" && "Generating repurpose plans..."}
              </h3>
              <p className="text-sm text-muted-foreground">This may take a moment</p>
            </CardContent>
          </Card>
        )}

        {/* Pipeline Steps */}
        {videos.length > 0 && !isLoading && (
          <div className="flex items-center gap-3">
            <Badge variant={step === "selected" ? "default" : "secondary"} className="gap-1">
              <Check className="h-3 w-3" /> Selected
            </Badge>
            <div className="h-px flex-1 bg-border" />
            {(step === "selected") && (
              <Button onClick={handleAnalyzeAll} size="sm" className="gap-2">
                <Wand2 className="h-4 w-4" /> Analyze Videos
              </Button>
            )}
            {(step === "analyzed" || step === "generated") && (
              <Badge variant={step === "analyzed" || step === "generated" ? "default" : "secondary"} className="gap-1">
                <Check className="h-3 w-3" /> Analyzed
              </Badge>
            )}
            <div className="h-px flex-1 bg-border" />
            {step === "analyzed" && (
              <Button onClick={handleGenerateAll} size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" /> Generate Plans
              </Button>
            )}
            {step === "generated" && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" /> Generated
              </Badge>
            )}
          </div>
        )}

        {/* Video Cards */}
        {videos.map((video: any) => {
          const id = video.contentItemId
          return (
            <Card key={id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {video.title || video.caption || "Untitled"}
                    </CardTitle>
                    <CardDescription className="mt-1">{video.selectionRationale}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="default" className="gap-1"><Trophy className="h-3 w-3" /> Viral</Badge>
                    {video.url && (
                      <a href={video.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium text-foreground">{video.metrics.views.toLocaleString()}</span> views
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span className="font-medium text-foreground">{video.metrics.likes.toLocaleString()}</span> likes
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium text-foreground">{video.metrics.comments}</span> comments
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium text-foreground">{(video.metrics.engagementProxy * 100).toFixed(2)}%</span> engagement
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">{video.hookType}</Badge>
                  <Badge variant="secondary">{video.topicCluster}</Badge>
                  <Badge variant="outline">{video.formatType}</Badge>
                  <Badge variant="secondary">{video.toneType}</Badge>
                </div>

                {/* Analysis */}
                {analyses[id] && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-primary" /> Why It Performed
                      </h4>
                      <ul className="space-y-1">
                        {analyses[id].whyItWorked.map((reason: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 rounded-lg border">
                          <div className="text-xs text-muted-foreground mb-1">Strongest Hook</div>
                          <div className="font-medium">{analyses[id].strongestHook}</div>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <div className="text-xs text-muted-foreground mb-1">Main Topic</div>
                          <div className="font-medium">{analyses[id].mainTopic}</div>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <div className="text-xs text-muted-foreground mb-1">Audience Angle</div>
                          <div className="font-medium">{analyses[id].targetAudienceAngle}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Repurpose Plan */}
                {plans[id] && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Repurpose Plan
                      </h4>

                      {/* Titles & Hooks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title Options</div>
                          {plans[id].titleOptions.map((title: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                              <span className="flex-1 text-sm font-medium">{title}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(title, `title-${id}-${i}`)}>
                                {copied === `title-${id}-${i}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hook Options</div>
                          {plans[id].hookOptions.map((hook: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                              <span className="flex-1 text-sm font-medium">{hook}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(hook, `hook-${id}-${i}`)}>
                                {copied === `hook-${id}-${i}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* On-Screen Headline & CTA */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg border">
                          <div className="text-xs text-muted-foreground mb-1">On-Screen Headline</div>
                          <div className="font-semibold">{plans[id].onScreenHeadline}</div>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <div className="text-xs text-muted-foreground mb-1">CTA</div>
                          <div className="font-semibold">{plans[id].cta}</div>
                        </div>
                      </div>

                      {/* Script */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rewritten Script</div>
                          <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => copyToClipboard(plans[id].rewrittenScript, `script-${id}`)}>
                            {copied === `script-${id}` ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                          </Button>
                        </div>
                        <ScrollArea className="max-h-48">
                          <div className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-4">
                            {plans[id].rewrittenScript}
                          </div>
                        </ScrollArea>
                      </div>

                      {/* Caption */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Caption / Description</div>
                          <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => copyToClipboard(plans[id].captionDescription, `caption-${id}`)}>
                            {copied === `caption-${id}` ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                          </Button>
                        </div>
                        <div className="text-sm bg-muted/50 rounded-lg p-4">
                          {plans[id].captionDescription}
                        </div>
                      </div>

                      {/* Alternate Angles */}
                      {plans[id].alternateAngles?.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alternate Angles</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {plans[id].alternateAngles.map((alt: any, i: number) => (
                              <div key={i} className="p-3 rounded-lg border space-y-1">
                                <Badge variant="outline" className="text-xs">{alt.angle}</Badge>
                                <div className="text-sm font-medium">{alt.title}</div>
                                <div className="text-xs text-muted-foreground">{alt.hook}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <Separator />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload(video)} disabled={downloading[id]}>
                          {downloading[id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          {downloading[id] ? "Downloading..." : "Download Original"}
                        </Button>
                        <Button size="sm" className="gap-2" onClick={() => handleRender(video)} disabled={rendering[id]}>
                          {rendering[id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
                          {rendering[id] ? (processingStep[id] || "Processing...") : "Repurpose with Overlay"}
                        </Button>
                        <Button variant="secondary" size="sm" className="gap-2" onClick={() => handleVoiceover(video)} disabled={voiceovering[id]}>
                          {voiceovering[id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                          {voiceovering[id] ? (processingStep[id] || "Processing...") : "Add AI Voiceover"}
                        </Button>
                        {video.url && (
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Play className="h-4 w-4" /> Watch Original
                            </Button>
                          </a>
                        )}
                      </div>

                      {/* Inline Video Previews */}
                      <div ref={(el) => { videoRefs.current[id] = el }}>
                        {(renderedUrls[id] || voiceoverUrls[id]) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {renderedUrls[id] && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Film className="h-3.5 w-3.5" /> Repurposed with Overlay
                                  </div>
                                  <a href={renderedUrls[id]} download>
                                    <Button variant="ghost" size="sm" className="h-7 gap-1">
                                      <Download className="h-3 w-3" /> Save
                                    </Button>
                                  </a>
                                </div>
                                <div className="rounded-xl overflow-hidden border bg-black aspect-[9/16] max-h-[520px] mx-auto">
                                  <video
                                    src={renderedUrls[id]}
                                    controls
                                    playsInline
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </div>
                            )}
                            {voiceoverUrls[id] && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Mic className="h-3.5 w-3.5" /> With AI Voiceover
                                  </div>
                                  <a href={voiceoverUrls[id]} download>
                                    <Button variant="ghost" size="sm" className="h-7 gap-1">
                                      <Download className="h-3 w-3" /> Save
                                    </Button>
                                  </a>
                                </div>
                                <div className="rounded-xl overflow-hidden border bg-black aspect-[9/16] max-h-[520px] mx-auto">
                                  <video
                                    src={voiceoverUrls[id]}
                                    controls
                                    playsInline
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}

        {/* Empty State */}
        {step === "idle" && (
          <Card>
            <CardContent className="py-16 text-center">
              <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Ready to Repurpose</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Select your top viral shorts and let MEDIAAI generate repurposed titles, hooks, scripts, and video overlays automatically.
              </p>
              <Button onClick={handleSelectTopVideos} className="gap-2">
                <Trophy className="h-4 w-4" />
                Select Top 2 Viral Shorts
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseLayout>
  )
}
