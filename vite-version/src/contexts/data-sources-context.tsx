"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { DataSourceKey, DataSourceConnection, DataSourceStatus } from "@/types/data-sources"

interface DataSourcesContextType {
  connections: Record<DataSourceKey, DataSourceConnection>
  connect: (key: DataSourceKey) => void
  disconnect: (key: DataSourceKey) => void
  getConnection: (key: DataSourceKey) => DataSourceConnection
  isConnected: (key: DataSourceKey) => boolean
}

const defaultConnection = (key: DataSourceKey): DataSourceConnection => ({
  key,
  status: 'not_connected',
  lastSync: null,
  notes: null,
  connectedAt: null,
})

const defaultConnections: Record<DataSourceKey, DataSourceConnection> = {
  email: defaultConnection('email'),
  calendar: defaultConnection('calendar'),
  notes: defaultConnection('notes'),
  quickbooks: defaultConnection('quickbooks'),
  bank: defaultConnection('bank'),
}

const STORAGE_KEY = 'aiceo_data_sources'

const DataSourcesContext = createContext<DataSourcesContextType | undefined>(undefined)

export function DataSourcesProvider({ children }: { children: React.ReactNode }) {
  const [connections, setConnections] = useState<Record<DataSourceKey, DataSourceConnection>>(defaultConnections)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConnections({ ...defaultConnections, ...parsed })
      } catch {
        setConnections(defaultConnections)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connections))
    }
  }, [connections, isLoaded])

  const connect = (key: DataSourceKey) => {
    const now = new Date().toISOString()
    setConnections(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: 'connected' as DataSourceStatus,
        connectedAt: now,
        lastSync: now,
      }
    }))
  }

  const disconnect = (key: DataSourceKey) => {
    setConnections(prev => ({
      ...prev,
      [key]: defaultConnection(key)
    }))
  }

  const getConnection = (key: DataSourceKey) => connections[key]

  const isConnected = (key: DataSourceKey) => connections[key].status === 'connected'

  return (
    <DataSourcesContext.Provider value={{ connections, connect, disconnect, getConnection, isConnected }}>
      {children}
    </DataSourcesContext.Provider>
  )
}

export function useDataSources() {
  const context = useContext(DataSourcesContext)
  if (!context) {
    throw new Error('useDataSources must be used within a DataSourcesProvider')
  }
  return context
}
