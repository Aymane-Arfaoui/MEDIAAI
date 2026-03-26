import { BaseLayout } from "@/components/layouts/base-layout"
import { Calendar } from "./components/calendar"
import { events, eventDates } from "./data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockTodayData } from "@/data/mock/brief-data"
import { Clock, Users, MapPin, FileText, CheckCircle2 } from "lucide-react"

export default function CalendarPage() {
  const data = mockTodayData

  return (
    <BaseLayout 
      title="Today" 
      description="Your schedule and priorities for today"
    >
      <div className="px-4 lg:px-6 space-y-6">
        {/* Today's Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Meetings Column */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Meetings
            </h2>
            <div className="space-y-4">
              {data.meetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meeting.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {meeting.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {meeting.attendees.length} attendees
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <FileText className="h-4 w-4 text-primary" />
                        Prep Brief
                      </div>
                      <p className="text-sm text-muted-foreground">{meeting.prepBrief}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Top Actions Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Top Actions Today
            </h2>
            <Card>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {data.topActions.map((action) => (
                    <li key={action.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 h-2 w-2 rounded-full ${action.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.context}</p>
                      </div>
                      <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {action.priority}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Calendar */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Full Calendar</h2>
          <Calendar events={events} eventDates={eventDates} />
        </div>
      </div>
    </BaseLayout>
  )
}
