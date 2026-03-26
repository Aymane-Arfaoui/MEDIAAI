"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { ArrowUp, BarChart3, CheckCircle2, Clock, ListTodo, Mail, Calendar, DollarSign } from "lucide-react"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { taskSchema, type Task } from "./data/schema"
import tasksData from "./data/tasks.json"
import { mockActionItems } from "@/data/mock/brief-data"

async function getTasks() {
  return z.array(taskSchema).parse(tasksData)
}

export default function TaskPage() {
  const [tasks, setTasks] = useState<z.infer<typeof taskSchema>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const taskList = await getTasks()
        setTasks(taskList)
      } catch (error) {
        console.error("Failed to load tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev])
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in progress").length,
    pending: tasks.filter(t => t.status === "pending").length,
  }

  if (loading) {
    return (
      <BaseLayout title="Action Items" description="AI-organized tasks from all your sources">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading action items...</div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout title="Action Items" description="AI-organized tasks from all your sources">
      {/* Mobile view placeholder */}
      <div className="md:hidden">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Action Items</h3>
            <p className="text-muted-foreground">
              Please use a larger screen to view the full interface.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Items</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.total}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <ListTodo className="size-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Completed</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.completed}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3">
                  <CheckCircle2 className="size-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">In Progress</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.inProgress}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-3">
                  <Clock className="size-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Pending</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.pending}</span>
                    <span className="flex items-center gap-0.5 text-sm text-orange-500">
                      <ArrowUp className="size-3.5" />
                      {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-3">
                  <BarChart3 className="size-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Items by Source */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                From Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockActionItems.fromEmail.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`mt-1 h-2 w-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.source}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{item.dueDate}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                From Meetings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockActionItems.fromMeetings.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`mt-1 h-2 w-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.source}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{item.dueDate}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                From Finance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockActionItems.fromFinance.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`mt-1 h-2 w-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.source}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{item.dueDate}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Action Items</CardTitle>
            <CardDescription>
              View, filter, and manage all your action items in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={tasks} columns={columns} onAddTask={handleAddTask} />
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
