"use client"

import { Mail } from "lucide-react"
import { SourceDetailLayout } from "../components/source-detail-layout"

export default function SourceEmailPage() {
  return <SourceDetailLayout sourceKey="email" icon={<Mail className="h-5 w-5 text-primary" />} />
}
