"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Sparkles,
  Send,
  User,
  Bot,
  Lightbulb,
  Loader2
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { api } from "@/lib/api-client/client"
import { useApp } from "@/lib/context/app-context"

const examplePrompts = [
  "What are my top performing content themes?",
  "Give me 5 video ideas about fundraising",
  "How can I improve my hooks?",
  "What topics should I avoid?",
  "Suggest hook variations for due diligence content",
  "Generate a script outline for startup legal mistakes"
]

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export default function AgentPage() {
  const { creatorId } = useApp()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (message?: string) => {
    const text = message || input.trim()
    if (!text || sending) return

    setInput("")
    setMessages(prev => [...prev, { role: "user", content: text }])
    setSending(true)

    try {
      const result = await api.sendMessage(creatorId, text, sessionId)
      setSessionId(result.sessionId)
      setMessages(prev => [...prev, { role: "assistant", content: result.response }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please make sure the backend server is running and try again." 
      }])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <BaseLayout>
      <div className="@container/main h-[calc(100vh-12rem)] flex gap-6 px-4 lg:px-6">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>AI Content Strategist</CardTitle>
                    <CardDescription>Chat with your creator intelligence agent</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Online
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col min-h-0 p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Welcome Message */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="text-sm font-medium">AI Strategist</div>
                      <div className="text-sm bg-muted/50 rounded-lg p-4 break-words">
                        <p className="mb-3">
                          Hi! I'm your AI content strategist for <strong>Kristina Subbotina / Lexsy</strong>. 
                          I've analyzed your content performance and I'm ready to help you with:
                        </p>
                        <ul className="space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>Content strategy and planning</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>Performance analysis and insights</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>Script and hook generation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>Topic and format recommendations</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Messages */}
                  {messages.map((message, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {message.role === 'user' ? (
                        <>
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="text-sm font-medium">You</div>
                            <div className="text-sm bg-primary/10 rounded-lg p-4 break-words overflow-wrap-anywhere">
                              {message.content}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="text-sm font-medium">AI Strategist</div>
                            <div className="text-sm bg-muted/50 rounded-lg p-4 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                              {message.content}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {sending && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-sm font-medium">AI Strategist</div>
                        <div className="text-sm bg-muted/50 rounded-lg p-4 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4 space-y-3">
                {/* Example Prompts */}
                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.slice(0, 3).map((prompt, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-7"
                        onClick={() => handleSend(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="flex items-end gap-2">
                  <Input 
                    placeholder="Ask about content strategy, performance, or get recommendations..." 
                    className="flex-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                  />
                  <Button size="icon" className="flex-shrink-0" onClick={() => handleSend()} disabled={sending || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Context Sidebar */}
        <div className="w-80 flex-shrink-0 space-y-4 hidden lg:block">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Creator Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Creator</div>
                <div className="font-medium">Kristina Subbotina</div>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Brand</div>
                <div className="font-medium">Lexsy</div>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Niche</div>
                <Badge variant="secondary">Startup Legal Education</Badge>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Audience</div>
                <div className="text-sm">Startup Founders & Early-Stage Operators</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Try Asking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {examplePrompts.slice(3).map((prompt, index) => (
                  <Button 
                    key={index}
                    variant="ghost" 
                    className="w-full justify-start text-xs h-auto py-2 px-3 text-left"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  )
}
