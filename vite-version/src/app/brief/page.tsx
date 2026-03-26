"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockBriefData } from "@/data/mock/brief-data"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Mail, 
  Calendar, 
  AlertTriangle,
  Clock,
  ArrowRight,
  FileText,
  CreditCard,
  RefreshCw
} from "lucide-react"
import { Link } from "react-router-dom"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export default function BriefPage() {
  const data = mockBriefData
  const isPositiveDelta = data.cashSnapshot.delta >= 0

  return (
    <BaseLayout title="Daily Brief" description="Your executive intelligence summary">
      <div className="px-4 md:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Daily Brief</h1>
            <p className="text-muted-foreground">{formatDate(data.date)}</p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Brief
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cash Position</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.cashSnapshot.currentBalance)}</p>
                  <div className={`flex items-center gap-1 text-sm ${isPositiveDelta ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositiveDelta ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {formatCurrency(Math.abs(data.cashSnapshot.delta))} ({data.cashSnapshot.deltaPercent}%)
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Invoices</p>
                  <p className="text-2xl font-bold">{data.overdueInvoices.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(data.overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0))} total
                  </p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <CreditCard className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Emails</p>
                  <p className="text-2xl font-bold">{data.criticalEmails.length}</p>
                  <p className="text-sm text-muted-foreground">Require attention</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Mail className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Meetings Today</p>
                  <p className="text-2xl font-bold">{data.meetingsToday.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.meetingsToday.filter(m => m.hasPrep).length} with prep ready
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                What Changed Overnight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.changesOvernight.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {change.type === 'payment' && <DollarSign className="h-4 w-4 text-green-500" />}
                      {change.type === 'expense' && <CreditCard className="h-4 w-4 text-orange-500" />}
                      {change.type === 'email' && <Mail className="h-4 w-4 text-blue-500" />}
                      {change.type === 'calendar' && <Calendar className="h-4 w-4 text-purple-500" />}
                    </div>
                    <span className="text-sm">{change.description}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risks Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.risksDetected.map((risk) => (
                  <li key={risk.id} className="flex items-start gap-3">
                    <Badge 
                      variant={risk.severity === 'high' ? 'destructive' : risk.severity === 'medium' ? 'default' : 'secondary'}
                      className="mt-0.5 text-xs"
                    >
                      {risk.severity}
                    </Badge>
                    <span className="text-sm">{risk.description}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Critical Communications
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/mail">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.criticalEmails.map((email) => (
                  <li key={email.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{email.subject}</span>
                      <Badge variant={email.urgency === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {email.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{email.from}</span>
                      <span>{email.receivedAt}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Meetings
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/calendar">View Calendar <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.meetingsToday.map((meeting) => (
                  <li key={meeting.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{meeting.title}</span>
                      {meeting.hasPrep && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" /> Prep Ready
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{meeting.time}</span>
                      <span>•</span>
                      <span>{meeting.duration}</span>
                      <span>•</span>
                      <span>{meeting.attendees} attendees</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Overdue Invoices
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {data.overdueInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{invoice.client}</p>
                      <p className="text-xs text-muted-foreground">{invoice.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      <Badge variant="destructive" className="text-xs">
                        {invoice.daysOverdue} days overdue
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  )
}
