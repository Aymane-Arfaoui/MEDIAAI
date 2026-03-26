"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { ModeToggle } from "@/components/mode-toggle"
import { getAppUrl } from "@/lib/utils"
import { Upload, Youtube, Instagram, Sparkles } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client/client"
import { useApp } from "@/lib/context/app-context"

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [youtubeOpen, setYoutubeOpen] = React.useState(false)
  const [instagramOpen, setInstagramOpen] = React.useState(false)
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [youtubeUrl, setYoutubeUrl] = React.useState("")
  const [isIngesting, setIsIngesting] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const { toast } = useToast()
  const { creatorId } = useApp()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleYouTubeIngest = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      })
      return
    }

    setIsIngesting(true)
    try {
      const result = await api.ingestYouTube(creatorId, youtubeUrl, 50)
      toast({
        title: "Success!",
        description: `Ingested ${result.ingested} videos from YouTube`,
      })
      setYoutubeOpen(false)
      setYoutubeUrl("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to ingest YouTube content",
        variant: "destructive",
      })
    } finally {
      setIsIngesting(false)
    }
  }

  const handleInstagramImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      let data: Record<string, unknown>[] = []

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parser
        const lines = text.split('\n').filter(l => l.trim())
        const headers = lines[0].split(',').map(h => h.trim())
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const obj: Record<string, unknown> = {}
          headers.forEach((h, i) => {
            obj[h] = values[i] || ''
          })
          return obj
        })
      }

      const result = await api.ingestInstagramImport(creatorId, data)
      toast({
        title: "Success!",
        description: `Imported ${result.ingested} Instagram posts`,
      })
      setInstagramOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import Instagram data",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const result = await api.uploadDocument(creatorId, file)
      toast({
        title: "Success!",
        description: `Uploaded ${file.name} - ${result.chunks} chunks created`,
      })
      setUploadOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          
          {/* Creator Badge */}
          <Badge variant="outline" className="hidden md:flex gap-2 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-medium">Kristina Subbotina</span>
          </Badge>
          
          <div className="flex-1 max-w-sm ml-4">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            {/* Ingest Actions */}
            <Dialog open={youtubeOpen} onOpenChange={setYoutubeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden lg:flex gap-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  Add YouTube
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ingest YouTube Content</DialogTitle>
                  <DialogDescription>
                    Enter a YouTube channel URL or video URL to analyze
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-url">YouTube URL</Label>
                    <Input
                      id="youtube-url"
                      placeholder="https://www.youtube.com/@KristinaSubbotinaEsq/shorts"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleYouTubeIngest} 
                    disabled={isIngesting}
                    className="w-full"
                  >
                    {isIngesting ? "Ingesting..." : "Ingest Content"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={instagramOpen} onOpenChange={setInstagramOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden lg:flex gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  Add Instagram
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Instagram Data</DialogTitle>
                  <DialogDescription>
                    Upload a CSV or JSON file with Instagram post data
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram-file">Select CSV or JSON File</Label>
                    <Input
                      id="instagram-file"
                      type="file"
                      accept=".csv,.json"
                      onChange={handleInstagramImport}
                      disabled={isImporting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Expected columns: url, caption, timestamp, likes, comments, views
                    </p>
                  </div>
                  {isImporting && (
                    <p className="text-sm text-muted-foreground">Importing and processing...</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Knowledge Document</DialogTitle>
                  <DialogDescription>
                    Upload PDFs, transcripts, notes, or markdown files
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Select File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.txt,.md,.csv,.json"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </div>
                  {isUploading && (
                    <p className="text-sm text-muted-foreground">Uploading and processing...</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            
            {/* AI Status Badge */}
            <Badge variant="outline" className="gap-1.5 hidden md:flex">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs">AI Ready</span>
            </Badge>
            
            <ModeToggle />
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
