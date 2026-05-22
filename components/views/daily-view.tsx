'use client'

import { TaskList } from '@/components/task-list'
import { Card, CardContent } from '@/components/ui/card'
import type { Task, DailyProgress, Streak } from '@/types/task'
import { Sun, Target, Flame, Gift } from 'lucide-react'

interface DailyViewProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  dailyProgress?: DailyProgress
  streak?: Streak
}

export function DailyView({ tasks, onToggle, onDelete, onUpdate, dailyProgress, streak }: DailyViewProps) {
  const pendingTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)
  const minTasks = 5

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-chart-1/10 p-2">
          <Sun className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Tareas Diarias</h1>
          <p className="text-sm text-muted-foreground">
            {pendingTasks.length} pendiente{pendingTasks.length !== 1 ? 's' : ''} hoy
          </p>
        </div>
      </div>

      {/* Daily Progress Mini Card */}
      {dailyProgress && (
        <Card className="border-none bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Progreso de hoy</span>
              </div>
              <div className="flex items-center gap-3">
                {streak && streak.current > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400 font-medium">{streak.current} días</span>
                  </div>
                )}
                <span className="text-sm font-bold text-primary">{dailyProgress.percentage}%</span>
              </div>
            </div>
            
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500"
                style={{ width: `${dailyProgress.percentage}%` }}
              />
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {completedTasks.length}/{Math.max(tasks.length, minTasks)} tareas
              </span>
              {dailyProgress.milestonesReached.length > 0 && (
                <div className="flex items-center gap-1">
                  <Gift className="h-3 w-3 text-accent" />
                  <span>{dailyProgress.milestonesReached.length} voucher{dailyProgress.milestonesReached.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {tasks.length < minTasks && (
              <p className="mt-2 text-xs text-warning">
                Agrega {minTasks - tasks.length} tarea{minTasks - tasks.length > 1 ? 's' : ''} más para mantener tu racha
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {pendingTasks.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Pendientes</h2>
          <TaskList
            tasks={pendingTasks}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </section>
      )}

      {completedTasks.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Completadas ({completedTasks.length})
          </h2>
          <TaskList
            tasks={completedTasks}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </section>
      )}

      {tasks.length === 0 && (
        <TaskList
          tasks={[]}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          emptyMessage="No tenes tareas diarias. Agrega al menos 5 para mantener tu racha"
        />
      )}
    </div>
  )
}
