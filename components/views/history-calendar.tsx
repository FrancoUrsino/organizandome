'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Trophy } from 'lucide-react'

interface HistoryCalendarProps {
  tasks: any[]
}

export function HistoryCalendar({ tasks }: HistoryCalendarProps) {
  // Calculamos dinámicamente los últimos 30 días basándonos en la fecha actual
  const activityData = useMemo(() => {
    const days = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0] // Formato "YYYY-MM-DD"

      // Filtramos las tareas creadas en este día específico usando el createdAt de Firebase
      const dayTasks = tasks.filter(t => t.createdAt?.startsWith(dateStr))
      
      const total = dayTasks.length
      const completed = dayTasks.filter(t => t.completed).length
      
      // Un día es "victoria" si hubo tareas creadas y se completaron absolutamente TODAS
      const isVictory = total > 0 && total === completed
      const intensity = total === 0 ? 0 : (completed / total)

      days.push({
        date: date,
        dateStr,
        isVictory,
        intensity,
        count: completed
      })
    }
    return days
  }, [tasks])

  return (
    <TooltipProvider>
      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-2 justify-between">
          {activityData.map((day) => (
            <Tooltip key={day.dateStr}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-300 cursor-help flex items-center justify-center",
                    day.intensity === 0 && "bg-muted/30 border border-dashed border-muted-foreground/20",
                    day.intensity > 0 && day.intensity < 1 && "bg-primary/20 border border-primary/10",
                    day.isVictory && "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md scale-105"
                  )}
                >
                  {day.isVictory && <Trophy className="h-4 w-4 text-white animate-bounce-short" />}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs p-2">
                <div className="text-center space-y-0.5">
                  <p className="font-bold">
                    {day.date.toLocaleDateString([], { day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-muted-foreground">
                    {day.count > 0 
                      ? `${day.count} tareas completadas` 
                      : "Sin tareas registradas"}
                  </p>
                  {day.isVictory && (
                    <p className="text-amber-500 font-extrabold flex items-center justify-center gap-1 mt-1 text-[11px]">
                      🏆 ¡DÍA PERFECTO!
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Leyenda Inferior */}
        <div className="mt-6 flex items-center justify-end gap-4 text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold border-t pt-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-muted/30 border border-dashed border-muted-foreground/20 rounded" />
            <span>Vacío</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-primary/20 rounded" />
            <span>En Progreso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded" />
            <span>Completado</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}