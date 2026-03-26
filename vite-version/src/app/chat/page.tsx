"use client"

import { useState, useRef, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Brain, Send, User, Sparkles } from "lucide-react"
import { mockChatResponses } from "@/data/mock/brief-data"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedPrompts = [
  "What changed this week?",
  "Which invoices are overdue?",
  "Where are we overspending?",
  "Which emails are critical today?",
  "Do we have redundant expenses?",
]

function getAIResponse(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('changed') || lowerQuery.includes('week') || lowerQuery.includes('update')) {
    return mockChatResponses['changed']
  }
  if (lowerQuery.includes('overdue') || lowerQuery.includes('invoice')) {
    return mockChatResponses['overdue']
  }
  if (lowerQuery.includes('overspend') || lowerQuery.includes('spending') || lowerQuery.includes('cost')) {
    return mockChatResponses['overspending']
  }
  if (lowerQuery.includes('critical') || lowerQuery.includes('urgent') || lowerQuery.includes('important')) {
    return mockChatResponses['critical']
  }
  if (lowerQuery.includes('redundant') || lowerQuery.includes('duplicate') || lowerQuery.includes('subscription')) {
    return mockChatResponses['redundant']
  }
  
  return mockChatResponses['default']
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm AI CEO, your executive intelligence assistant. I can help you understand your business data, answer questions about finances, emails, and operations. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (content: string = input) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  return (
    <BaseLayout title="Ask AI CEO" description="Chat with your business intelligence">
      <div className="px-4 md:px-6 h-[calc(100vh-12rem)]">
        <div className="flex flex-col h-full max-w-4xl mx-auto">
          {/* Chat Messages */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={`h-8 w-8 ${message.role === 'assistant' ? 'bg-primary' : 'bg-secondary'}`}>
                      <AvatarFallback>
                        {message.role === 'assistant' ? (
                          <Brain className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-primary">
                      <AvatarFallback>
                        <Brain className="h-4 w-4 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Suggested Prompts */}
            <div className="px-4 py-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Suggested questions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSend(prompt)}
                    disabled={isTyping}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <CardContent className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI CEO anything about your business..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button type="submit" disabled={!input.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  )
}
