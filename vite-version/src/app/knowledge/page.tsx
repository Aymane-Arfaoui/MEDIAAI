"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Upload, 
  FileText, 
  File,
  Search,
  CheckCircle2,
  Trash2,
  Loader2
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { api } from "@/lib/api-client/client"
import { useApp } from "@/lib/context/app-context"
import { useToast } from "@/hooks/use-toast"

export default function KnowledgePage() {
  const { creatorId } = useApp()
  const { toast } = useToast()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocuments()
  }, [creatorId])

  const loadDocuments = async () => {
    try {
      const result = await api.getKnowledgeDocuments(creatorId)
      setDocuments(result.documents || [])
    } catch (error) {
      console.error("Failed to load documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await api.uploadDocument(creatorId, file)
      toast({
        title: "Upload Complete",
        description: `${file.name} processed with ${result.chunks} chunks`,
      })
      await loadDocuments()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      await api.deleteKnowledgeDocument(documentId)
      toast({ title: "Deleted", description: "Document removed" })
      await loadDocuments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <BaseLayout title="Knowledge Base" description="Upload and manage creator context and content">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout 
      title="Knowledge Base" 
      description="Upload and manage creator context and content"
    >
      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Knowledge Files</CardTitle>
            <CardDescription>Upload PDFs, transcripts, notes, or other context files</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
              ) : (
                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              )}
              <div className="text-sm font-medium mb-1">
                {uploading ? "Processing..." : "Drop files here or click to browse"}
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                Supports PDF, TXT, MD, CSV, JSON
              </div>
              <Button variant="outline" size="sm" disabled={uploading}>
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.csv,.json"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Library */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Knowledge Library</CardTitle>
                <CardDescription>
                  {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
                <p className="text-muted-foreground">
                  Upload PDFs, transcripts, or notes to give your AI strategist more context
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="font-medium">{doc.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
