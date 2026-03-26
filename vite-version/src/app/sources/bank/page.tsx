"use client"

import { Building2 } from "lucide-react"
import { SourceDetailLayout } from "../components/source-detail-layout"

export default function SourceBankPage() {
  return <SourceDetailLayout sourceKey="bank" icon={<Building2 className="h-5 w-5 text-primary" />} />
}
