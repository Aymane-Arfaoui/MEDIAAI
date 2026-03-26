"use client"

import { FileText } from "lucide-react"
import { SourceDetailLayout } from "../components/source-detail-layout"

export default function SourceNotesPage() {
  return <SourceDetailLayout sourceKey="notes" icon={<FileText className="h-5 w-5 text-primary" />} />
}
