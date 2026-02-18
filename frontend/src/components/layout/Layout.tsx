// src/components/layout/Layout.tsx
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  MapPin, 
  Wrench,
  Fuel,
  Map,
  NotepadText,
  BarChart3
} from 'lucide-react'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import Header from '@/components/layout/Header'
import { cn } from '@/lib/utils'
import Sidebar, { type NavigationItem } from '@/components/layout/Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Estatísticas', href: '/estatisticas', icon: BarChart3 },
  { name: 'Veículos', href: '/veiculos', icon: Truck },
  { name: 'Motoristas', href: '/motoristas', icon: Users },
  { name: 'Viagens', href: '/viagens', icon: MapPin },
  { name: 'Manutenção', href: '/manutencao', icon: Wrench },
  { name: 'Abastecimento', href: '/abastecimento', icon: Fuel },
  { name: 'Cidades', href: '/cidades', icon: Map },
  { name: 'Relatorios', href: '/relatorios', icon: NotepadText}
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div 
          className="fixed inset-0 overlay" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-card shadow-xl">
          <Sidebar
            navigation={navigation} 
            currentPath={location.pathname}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:z-40">
        <Sidebar
          navigation={navigation} 
          currentPath={location.pathname} 
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Error boundary to avoid blank pages on render errors */}
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}