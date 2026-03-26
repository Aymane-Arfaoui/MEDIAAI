import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { DataSourcesProvider } from '@/contexts/data-sources-context'
import { AppProvider } from '@/lib/context/app-context'
import { AppRouter } from '@/components/router/app-router'
import { Toaster } from '@/components/ui/toaster'
import { useEffect } from 'react'
import { initGTM } from '@/utils/analytics'

const basename = import.meta.env.VITE_BASENAME || ''

function App() {
  useEffect(() => {
    initGTM();
  }, []);

  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppProvider>
          <SidebarConfigProvider>
            <DataSourcesProvider>
              <Router basename={basename}>
                <AppRouter />
              </Router>
            </DataSourcesProvider>
          </SidebarConfigProvider>
          <Toaster />
        </AppProvider>
      </ThemeProvider>
    </div>
  )
}

export default App
