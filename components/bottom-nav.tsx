'use client'

import { LayoutGrid, CalendarDays, Calendar, CalendarRange } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewType = 'dashboard' | 'diarias' | 'semanal' | 'mensual'

interface BottomNavProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

const navItems: { view: ViewType; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Inicio', icon: LayoutGrid },
  { view: 'diarias', label: 'Diarias', icon: CalendarDays },
  { view: 'semanal', label: 'Semanal', icon: Calendar },
  { view: 'mensual', label: 'Mensual', icon: CalendarRange },
]

export function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
              activeView === view
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={label}
            aria-current={activeView === view ? 'page' : undefined}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-transform',
                activeView === view && 'scale-110'
              )}
            />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
