'use client'

import { Moon, Sun, Flower2, Flame, Bell } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  useFirebase: boolean
  streak?: number
  unreadNotifications?: number
}

export function Header({ useFirebase, streak = 0, unreadNotifications = 0 }: HeaderProps) {
  const { theme, toggleTheme, mounted } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Flower2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">ORGANIZÁNDOME</span>
            <span className="text-xs text-muted-foreground">Organizá tus días</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 px-2.5 py-1 text-xs font-medium">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-orange-600 dark:text-orange-400">{streak}</span>
            </div>
          )}

          {useFirebase ? (
            <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Firebase
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Demo
            </span>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full"
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {mounted && (
              theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
