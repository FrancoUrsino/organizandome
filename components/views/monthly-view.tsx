'use client'

import { TaskCard } from '@/components/task-card'
import type { Task } from '@/types/task'
import { CalendarRange, ListTodo, Target } from 'lucide-react'

interface MonthlyViewProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

export function MonthlyView({ tasks, onToggle, onDelete, onUpdate }: MonthlyViewProps) {
  const pendingCount = tasks.filter((t) => !t.completed).length
  const completedCount = tasks.filter((t) => t.completed).length

  // Group tasks by week (days 1-7, 8-14, 15-21, 22-31)
  const weeks = [
    { label: 'Semana 1', start: 1, end: 7 },
    { label: 'Semana 2', start: 8, end: 14 },
    { label: 'Semana 3', start: 15, end: 21 },
    { label: 'Semana 4', start: 22, end: 31 },
  ]

  const getTasksForWeek = (start: number, end: number) =>
    tasks.filter((t) => t.monthDay && t.monthDay >= start && t.monthDay <= end)

  const unassignedTasks = tasks.filter((t) => !t.monthDay)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-chart-3/10 p-2">
          <CalendarRange className="h-5 w-5 text-chart-3" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Metas Mensuales</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} este mes
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No agregaste metas mensuales </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Objetivos del mes tocando el +
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Summary */}
          <div className="rounded-xl border border-border/50 bg-gradient-to-r from-chart-3/5 to-accent/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Progreso del Mes</p>
                <p className="text-2xl font-bold">
                  {completedCount}/{tasks.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-success">{completedCount}</p>
              </div>
            </div>
            {tasks.length > 0 && (
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-chart-3 to-accent transition-all"
                  style={{
                    width: `${(completedCount / tasks.length) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Weeks Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {weeks.map(({ label, start, end }) => {
              const weekTasks = getTasksForWeek(start, end)

              return (
                <div
                  key={label}
                  className="rounded-xl border border-border/50 bg-card p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">{label}</h3>
                    <span className="text-xs text-muted-foreground">
                      Días {start}-{end}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {weekTasks.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        Sin metas
                      </p>
                    ) : (
                      weekTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={onToggle}
                          onDelete={onDelete}
                          onUpdate={onUpdate}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Unassigned Tasks */}
          {unassignedTasks.length > 0 && (
            <div className="rounded-xl border border-dashed border-border p-4">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Sin fecha asignada
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {unassignedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
