import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useNpcManager } from './hooks/useNpcManager'
import AuthScreen from './features/auth/AuthScreen'
import AppShell from './features/layout/AppShell'
import ScrollbarStyle from './components/common/ScrollbarStyle'

export default function App() {
  const { session, user, authLoading, signOut } = useAuth()
  const [sidebarTab, setSidebarTab] = useState('banco')

  const manager = useNpcManager(user, sidebarTab)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  if (manager.dataLoading || !manager.data) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        Carregando fichas...
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <ScrollbarStyle />

      <AppShell
        user={user}
        signOut={signOut}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        manager={manager}
      />
    </div>
  )
}