"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CardDecorator } from '@/components/ui/card-decorator'
import { Brain, Mail, DollarSign, TrendingUp, ArrowRight } from 'lucide-react'
import { getAppUrl } from '@/lib/utils'

const capabilities = [
  {
    icon: Mail,
    title: 'Email Intelligence',
    description: 'AI prioritizes your inbox, identifies critical messages, suggests replies, and tracks threads waiting on responses.'
  },
  {
    icon: DollarSign,
    title: 'Financial Oversight',
    description: 'Monitor cash position, track overdue invoices, identify redundant spend, and flag bookkeeping issues automatically.'
  },
  {
    icon: Brain,
    title: 'Ask AI CEO',
    description: 'Chat with your business data. Ask questions like "Which invoices are overdue?" or "Where are we overspending?"'
  },
  {
    icon: TrendingUp,
    title: 'AutoML Predictions',
    description: 'Build predictive models for cashflow forecasting, risk detection, process optimization, and scenario simulation.'
  }
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            About AI CEO
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Executive intelligence, not another dashboard
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            AI CEO isn't just another analytics tool. It's an intelligent system that understands your business context,
            prioritizes what matters, and proactively surfaces insights you'd otherwise miss.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {capabilities.map((capability, index) => (
            <Card key={index} className='group shadow-xs py-2'>
              <CardContent className='p-8'>
                <div className='flex flex-col items-center text-center'>
                  <CardDecorator>
                    <capability.icon className='h-6 w-6' aria-hidden />
                  </CardDecorator>
                  <h3 className='mt-6 font-medium text-balance'>{capability.title}</h3>
                  <p className='text-muted-foreground mt-3 text-sm'>{capability.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-muted-foreground">Built for business owners who want clarity, not complexity</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="cursor-pointer" asChild>
              <a href={getAppUrl("/sources")}>
                Connect Your Data
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="cursor-pointer" asChild>
              <a href={getAppUrl("/settings/account")}>
                Request Demo
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
