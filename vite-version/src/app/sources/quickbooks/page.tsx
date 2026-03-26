"use client"

import { Receipt } from "lucide-react"
import { SourceDetailLayout } from "../components/source-detail-layout"

export default function SourceQuickbooksPage() {
  return <SourceDetailLayout sourceKey="quickbooks" icon={<Receipt className="h-5 w-5 text-primary" />} />
}
