export const mockBriefData = {
  date: new Date().toISOString(),
  cashSnapshot: {
    currentBalance: 847293.50,
    previousBalance: 832145.00,
    delta: 15148.50,
    deltaPercent: 1.82,
  },
  overdueInvoices: [
    { id: 'INV-001', client: 'Acme Corp', amount: 12500, daysOverdue: 15 },
    { id: 'INV-002', client: 'TechStart Inc', amount: 8750, daysOverdue: 7 },
    { id: 'INV-003', client: 'Global Services', amount: 3200, daysOverdue: 3 },
  ],
  criticalEmails: [
    { id: 'email-1', from: 'john@client.com', subject: 'Contract renewal decision needed', urgency: 'high', receivedAt: '2 hours ago' },
    { id: 'email-2', from: 'sarah@vendor.com', subject: 'Price increase notice - action required', urgency: 'high', receivedAt: '4 hours ago' },
    { id: 'email-3', from: 'mike@partner.com', subject: 'Q2 projections attached', urgency: 'medium', receivedAt: '6 hours ago' },
  ],
  meetingsToday: [
    { id: 'meet-1', title: 'Board Meeting', time: '10:00 AM', duration: '2h', attendees: 8, hasPrep: true },
    { id: 'meet-2', title: 'Sales Pipeline Review', time: '2:00 PM', duration: '1h', attendees: 4, hasPrep: true },
    { id: 'meet-3', title: '1:1 with CFO', time: '4:30 PM', duration: '30m', attendees: 2, hasPrep: false },
  ],
  risksDetected: [
    { id: 'risk-1', type: 'cash_flow', description: 'Projected cash shortfall in 45 days if outstanding invoices not collected', severity: 'medium' },
    { id: 'risk-2', type: 'subscription', description: '3 redundant SaaS subscriptions detected ($1,240/mo)', severity: 'low' },
    { id: 'risk-3', type: 'accounting', description: 'Unreconciled transactions from last month detected', severity: 'medium' },
  ],
  changesOvernight: [
    { type: 'payment', description: '$15,000 payment received from DataFlow Inc' },
    { type: 'expense', description: '$2,340 charged to corporate card (AWS)' },
    { type: 'email', description: '12 new emails, 3 flagged as critical' },
    { type: 'calendar', description: '2 meeting invites pending response' },
  ]
}

export const mockEmailIntelligence = {
  critical: [
    { id: 1, from: 'John Smith', email: 'john@clientcorp.com', subject: 'Contract renewal - decision needed by EOW', preview: 'Hi, we need your decision on the renewal terms...', time: '2 hours ago', category: 'critical' },
    { id: 2, from: 'Sarah Chen', email: 'sarah@vendor.io', subject: 'Price adjustment notice - 15% increase', preview: 'Due to market conditions, we are adjusting...', time: '4 hours ago', category: 'critical' },
  ],
  needsReply: [
    { id: 3, from: 'Mike Johnson', email: 'mike@partner.com', subject: 'Re: Q2 Partnership proposal', preview: 'Thanks for the proposal. A few questions...', time: '1 day ago', category: 'needs_reply' },
    { id: 4, from: 'Lisa Park', email: 'lisa@investor.vc', subject: 'Follow up: Board deck review', preview: 'When can we schedule time to review...', time: '2 days ago', category: 'needs_reply' },
  ],
  waitingOn: [
    { id: 5, from: 'You', to: 'legal@firm.com', subject: 'Contract review request', preview: 'Please review the attached agreement...', time: '3 days ago', category: 'waiting' },
    { id: 6, from: 'You', to: 'cfo@company.com', subject: 'Budget approval needed', preview: 'Attached is the Q2 budget for approval...', time: '5 days ago', category: 'waiting' },
  ],
  fyi: [
    { id: 7, from: 'Newsletter', email: 'news@industry.com', subject: 'Weekly Market Update', preview: 'This week in tech: AI developments...', time: '6 hours ago', category: 'fyi' },
    { id: 8, from: 'HR Team', email: 'hr@company.com', subject: 'New PTO policy update', preview: 'We are updating our PTO policy...', time: '1 day ago', category: 'fyi' },
  ]
}

export const mockActionItems = {
  fromEmail: [
    { id: 'ae-1', title: 'Respond to contract renewal request', source: 'Email from John Smith', priority: 'high', dueDate: 'Today' },
    { id: 'ae-2', title: 'Review vendor price increase notice', source: 'Email from Sarah Chen', priority: 'high', dueDate: 'Tomorrow' },
  ],
  fromMeetings: [
    { id: 'am-1', title: 'Prepare board meeting presentation', source: 'Board Meeting @ 10:00 AM', priority: 'high', dueDate: 'Today' },
    { id: 'am-2', title: 'Update sales pipeline numbers', source: 'Sales Review @ 2:00 PM', priority: 'medium', dueDate: 'Today' },
  ],
  fromFinance: [
    { id: 'af-1', title: 'Follow up on overdue invoice INV-001', source: 'Finance Alert', priority: 'high', dueDate: 'Today' },
    { id: 'af-2', title: 'Review redundant subscriptions', source: 'Cost Analysis', priority: 'low', dueDate: 'This Week' },
  ]
}

export const mockTodayData = {
  meetings: [
    { 
      id: 'm1', 
      title: 'Board Meeting', 
      time: '10:00 AM - 12:00 PM',
      attendees: ['CEO', 'CFO', 'Board Members'],
      location: 'Conference Room A',
      prepBrief: 'Key topics: Q1 results, hiring plan, Series B timeline. Review attached deck slides 1-15.',
    },
    { 
      id: 'm2', 
      title: 'Sales Pipeline Review', 
      time: '2:00 PM - 3:00 PM',
      attendees: ['Sales Lead', 'Account Managers'],
      location: 'Zoom',
      prepBrief: 'Focus on deals closing this month. 3 deals at risk, prepare mitigation strategies.',
    },
    { 
      id: 'm3', 
      title: '1:1 with CFO', 
      time: '4:30 PM - 5:00 PM',
      attendees: ['CFO'],
      location: 'Office',
      prepBrief: 'Discuss cash flow projections and vendor payment schedule.',
    },
  ],
  topActions: [
    { id: 'ta1', title: 'Sign contract renewal', priority: 'high', context: 'Deadline: EOD' },
    { id: 'ta2', title: 'Review Q2 budget proposal', priority: 'high', context: 'Before CFO meeting' },
    { id: 'ta3', title: 'Approve marketing spend', priority: 'medium', context: 'Waiting since 3 days' },
  ]
}

export const mockChatResponses: Record<string, string> = {
  'changed': `Here's what changed this week:

**Financial:**
- Cash position increased by $15,148 (+1.82%)
- 3 new invoices sent totaling $42,500
- $18,340 in expenses processed

**Communications:**
- 47 new emails received, 5 flagged as critical
- 3 meeting invites pending your response
- 2 contract documents awaiting signature

**Operations:**
- Sales pipeline grew by $125,000
- 2 new deals moved to negotiation stage
- 1 customer escalation resolved`,

  'overdue': `You have 3 overdue invoices totaling $24,450:

1. **INV-001 - Acme Corp** - $12,500 (15 days overdue)
   - Last contact: 5 days ago
   - Recommendation: Send final notice, consider collections

2. **INV-002 - TechStart Inc** - $8,750 (7 days overdue)
   - Last contact: 2 days ago
   - Recommendation: Follow up call scheduled for tomorrow

3. **INV-003 - Global Services** - $3,200 (3 days overdue)
   - No follow-up yet
   - Recommendation: Send friendly reminder today`,

  'overspending': `I've identified potential overspending in these areas:

**SaaS Subscriptions:**
- 3 redundant tools detected: $1,240/month savings possible
- Slack + Teams (choose one): $450/mo
- Zoom + Google Meet (choose one): $290/mo
- 2 unused Figma licenses: $500/mo

**Operational:**
- AWS spending up 23% vs last quarter
- Consider reserved instances for $800/mo savings

**Marketing:**
- Ad spend efficiency down 15%
- Recommend reallocating $5,000 to higher-performing channels`,

  'critical': `You have 2 critical emails requiring immediate attention:

1. **Contract renewal decision needed** (2 hours ago)
   From: John Smith <john@clientcorp.com>
   → Decision needed by end of week
   → Contract value: $150,000/year
   
2. **Price adjustment notice** (4 hours ago)
   From: Sarah Chen <sarah@vendor.io>
   → 15% price increase effective next month
   → Current spend: $24,000/year
   → Impact: +$3,600 annually

Would you like me to draft responses for either of these?`,

  'redundant': `I found these potentially redundant expenses:

**Communication Tools:** $740/mo
- Slack: $450/mo (28 seats)
- Microsoft Teams: $290/mo (included with Office 365)
→ Recommendation: Consolidate to one platform

**Video Conferencing:** $500/mo
- Zoom Pro: $300/mo
- Google Meet (with Workspace): $200/mo
→ Recommendation: Use Meet (already included)

**Design Tools:** $500/mo
- 2 Figma licenses unused for 60+ days
→ Recommendation: Reduce to active users only

**Total potential savings: $1,740/month ($20,880/year)**`,

  'default': `I can help you with:

- **Financial insights:** "What changed this week?", "Which invoices are overdue?"
- **Spending analysis:** "Where are we overspending?", "Do we have redundant expenses?"
- **Communication triage:** "Which emails are critical today?"
- **Meeting prep:** "What should I prepare for today's meetings?"

What would you like to know?`
}
