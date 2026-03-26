"use client"

import {
  Youtube,
  Instagram,
  ArrowRight,
  Upload,
  Brain,
  Calendar,
  BarChart3,
  Target,
  Sparkles,
  Shield,
  Lock,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image3D } from '@/components/image-3d'
import { getAppUrl } from '@/lib/utils'

const coreFeatures = [
  {
    icon: BarChart3,
    title: 'Public Content Analysis',
    description: 'Analyze YouTube videos and Instagram posts without requiring creator login.'
  },
  {
    icon: Target,
    title: 'Knowledge-Powered Strategy',
    description: 'Upload brand docs, transcripts, and notes to inform AI recommendations.'
  },
  {
    icon: Calendar,
    title: 'Weekly Content Planner',
    description: 'Get a full week of content ideas with hooks, outlines, and rationale.'
  },
  {
    icon: Sparkles,
    title: 'Interactive AI Agent',
    description: 'Chat with your strategist to refine ideas and generate scripts on demand.'
  }
]

const howItWorksSteps = [
  {
    icon: Youtube,
    title: 'Add YouTube channel or Instagram CSV',
    description: 'Paste a YouTube URL or upload Instagram export data. No login required.'
  },
  {
    icon: Upload,
    title: 'Upload brand docs, notes, transcripts',
    description: 'Add PDFs, transcripts, or notes to give MEDIAAI context about your brand and style.'
  },
  {
    icon: Brain,
    title: 'Get analytics, strategy, calendar, and scripts',
    description: 'MEDIAAI analyzes performance, generates strategy, and creates a weekly content plan.'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Core Features */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Core Features</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything you need for creator strategy
          </h2>
          <p className="text-lg text-muted-foreground">
            MEDIAAI analyzes public content, learns from your knowledge base, and generates actionable strategy.
          </p>
        </div>

        {/* First Feature Section - Core Features */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          <Image3D
            lightSrc="feature-1-light.png"
            darkSrc="feature-1-dark.png"
            alt="MEDIAAI Analytics Dashboard"
            direction="left"
          />
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Data-driven content intelligence
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                No social login required. Just analyze public content and upload context files to get strategic insights.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {coreFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer" asChild>
                <a href={getAppUrl("/overview")} className='flex items-center'>
                  View Demo Workspace
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <a href={getAppUrl("/knowledge")}>
                  Upload Content
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Three steps to creator intelligence
          </h2>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          <div className="space-y-6 order-2 lg:order-1">
            <ul className="grid gap-4">
              {howItWorksSteps.map((step, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-4 p-4 rounded-lg transition-colors border">
                  <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium flex items-center gap-2 mb-1">
                      <step.icon className="size-4 text-primary" />
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Image3D
            lightSrc="feature-2-light.png"
            darkSrc="feature-2-dark.png"
            alt="MEDIAAI Content Planning"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div>

        {/* Target Audience Section */}
        <div id="for-who" className="mt-24 mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Built For</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Creators who take strategy seriously
            </h2>
            <p className="text-lg text-muted-foreground">
              Perfect for educational creators, founder-led brands, and service businesses
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-lg border bg-card">
              <Target className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Educational Creators</h3>
              <p className="text-sm text-muted-foreground">Teach complex topics and want data-driven content strategy to maximize impact.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Sparkles className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Founder-Led Brands</h3>
              <p className="text-sm text-muted-foreground">Build thought leadership and need strategic guidance for content planning.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Brain className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Service Businesses</h3>
              <p className="text-sm text-muted-foreground">Use content to attract clients and want to optimize messaging and topics.</p>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="mt-16 mx-auto max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-lg border bg-muted/50">
              <Lock className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">No Social Login Required</h3>
              <p className="text-sm text-muted-foreground">Analyze public content only. We never ask for account access.</p>
            </div>
            <div className="p-6 rounded-lg border bg-muted/50">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Your Data Stays Yours</h3>
              <p className="text-sm text-muted-foreground">Knowledge base files are encrypted and only used for your strategy.</p>
            </div>
            <div className="p-6 rounded-lg border bg-muted/50">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Frictionless Setup</h3>
              <p className="text-sm text-muted-foreground">Start analyzing in minutes. No complex integrations or API keys.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
