'use client'

// 1. Sumamos "BrainCircuit" a los iconos importados de lucide-react
import { LayoutGrid, CalendarDays, Calendar, CalendarRange, BrainCircuit } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ViewType } from '@/components/bottom-nav'

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

// 2. Agregamos el planificador al arreglo dinámico
const navItems: { view: ViewType; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { view: 'diarias', label: 'Tareas Diarias', icon: CalendarDays },
  { view: 'semanal', label: 'Tareas Semanales', icon: Calendar },
  { view: 'mensual', label: 'Tareas Mensuales', icon: CalendarRange },
  { view: 'planificador', label: 'Planificador', icon: BrainCircuit },
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-border/40 bg-sidebar">
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {navItems.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                activeView === view
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-current={activeView === view ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="border-t border-border/40 p-4">
        <div className="rounded-lg bg-secondary/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            ¡¡Organiza tus tareas!!
          </p>
        </div>
      </div>
    </aside>
  )
}