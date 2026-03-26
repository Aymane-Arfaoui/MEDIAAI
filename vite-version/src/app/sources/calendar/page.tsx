"use client"

import { Calendar } from "lucide-react"
import { SourceDetailLayout } from "../components/source-detail-layout"

export default function SourceCalendarPage() {
  return <SourceDetailLayout sourceKey="calendar" icon={<Calendar className="h-5 w-5 text-primary" />} />
}
