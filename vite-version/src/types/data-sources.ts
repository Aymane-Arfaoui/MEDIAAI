export type DataSourceKey = 'email' | 'calendar' | 'notes' | 'quickbooks' | 'bank'

export type DataSourceStatus = 'not_connected' | 'connected' | 'error' | 'syncing'

export interface DataSourceConnection {
  key: DataSourceKey
  status: DataSourceStatus
  lastSync: string | null
  notes: string | null
  connectedAt: string | null
}

export interface DataSourceConfig {
  key: DataSourceKey
  name: string
  description: string
  icon: string
  permissions: string[]
}

export const DATA_SOURCE_CONFIGS: Record<DataSourceKey, DataSourceConfig> = {
  email: {
    key: 'email',
    name: 'Email',
    description: 'Connect your email to analyze communications and surface critical messages',
    icon: 'Mail',
    permissions: ['Read emails', 'Read email metadata', 'No sending permissions']
  },
  calendar: {
    key: 'calendar',
    name: 'Calendar',
    description: 'Sync your calendar to prepare briefs for meetings and align action items',
    icon: 'Calendar',
    permissions: ['Read calendar events', 'Read attendee info', 'No modification permissions']
  },
  notes: {
    key: 'notes',
    name: 'Notes',
    description: 'Connect your notes app to extract action items and context',
    icon: 'FileText',
    permissions: ['Read notes', 'Read note metadata', 'No editing permissions']
  },
  quickbooks: {
    key: 'quickbooks',
    name: 'QuickBooks',
    description: 'Connect QuickBooks for financial insights and invoice tracking',
    icon: 'Receipt',
    permissions: ['Read invoices', 'Read expenses', 'Read reports', 'No transaction permissions']
  },
  bank: {
    key: 'bank',
    name: 'Bank Account',
    description: 'Connect via Plaid for cash position monitoring and transaction analysis',
    icon: 'Building2',
    permissions: ['Read balances', 'Read transactions', 'No transfer permissions']
  }
}
