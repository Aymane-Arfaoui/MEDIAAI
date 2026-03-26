"use client"

import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: 'item-1',
    question: 'How does AI CEO connect to my data sources?',
    answer:
      'AI CEO uses secure OAuth connections and API integrations to connect with your email, calendar, QuickBooks, and banking services. All connections are read-only, meaning we can view your data to generate insights but never modify anything.',
  },
  {
    value: 'item-2',
    question: 'Is my business data secure?',
    answer:
      'Security is our top priority. All data is encrypted in transit and at rest. We offer both cloud and on-premise deployment options. Cloud deployments are SOC 2 compliant, and you maintain full control to revoke access at any time.',
  },
  {
    value: 'item-3',
    question: 'What data sources can I connect?',
    answer:
      'AI CEO currently supports: Email (Gmail, Outlook, etc.), Calendar (Google Calendar, Outlook), Notes apps, QuickBooks for accounting, and bank accounts via Plaid. We are continuously adding more integrations.',
  },
  {
    value: 'item-4',
    question: 'How does the Daily Brief work?',
    answer:
      'Every morning, AI CEO analyzes all your connected data sources to generate a personalized executive brief. It highlights what changed overnight, critical communications, today\'s priorities, financial updates, and potential risks—all in one view.',
  },
  {
    value: 'item-5',
    question: 'Can I deploy AI CEO on my own servers?',
    answer:
      'Yes! We offer an enterprise on-premise deployment option for organizations that require complete data sovereignty. Your data never leaves your infrastructure, and you maintain full control over the system.',
  },
  {
    value: 'item-6',
    question: 'What is the AutoML add-on?',
    answer:
      'The AutoML add-on uses your centralized business data to build predictive models. It can forecast cash flow, detect risk trends, identify optimization opportunities, and simulate different business scenarios to help you make better decisions.',
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about AI CEO, data security, and getting started. Still have questions? We're here to help!
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className='bg-transparent'>
            <div className='p-0'>
              <Accordion type='single' collapsible className='space-y-5'>
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value} className='rounded-md !border bg-transparent'>
                    <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                          <CircleHelp className='size-5' />
                        </div>
                        <span className='text-start font-semibold'>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-4 bg-transparent'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help.
            </p>
            <Button className='cursor-pointer' asChild>
              <a href="#contact">
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
