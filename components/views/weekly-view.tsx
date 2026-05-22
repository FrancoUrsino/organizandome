'use client'

import { TaskCard } from '@/components/task-card'
import type { Task, DayOfWeek } from '@/types/task'
import { Calendar, ListTodo } from 'lucide-react'

interface WeeklyViewProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

const daysOfWeek: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'lunes', label: 'Lunes', short: 'Lun' },
  { key: 'martes', label: 'Martes', short: 'Mar' },
  { key: 'miercoles', label: 'Miércoles', short: 'Mié' },
  { key: 'jueves', label: 'Jueves', short: 'Jue' },
  { key: 'viernes', label: 'Viernes', short: 'Vie' },
  { key: 'sabado', label: 'Sábado', short: 'Sáb' },
  { key: 'domingo', label: 'Domingo', short: 'Dom' },
]

export function WeeklyView({ tasks, onToggle, onDelete, onUpdate }: WeeklyViewProps) {
  const getTasksForDay = (day: DayOfWeek) => tasks.filter((t) => t.dayOfWeek === day)
  const unassignedTasks = tasks.filter((t) => !t.dayOfWeek)

  const pendingCount = tasks.filter((t) => !t.completed).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-chart-2/10 p-2">
          <Calendar className="h-5 w-5 text-chart-2" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Tareas Semanales</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} esta semana
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <ListTodo className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No tenes tareas semanales</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Usa el botón + para agregar tu primer tarea
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Days Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {daysOfWeek.map(({ key, label, short }) => {
              const dayTasks = getTasksForDay(key)
              const completedCount = dayTasks.filter((t) => t.completed).length

              return (
                <div
                  key={key}
                  className="rounded-xl border border-border/50 bg-card p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      <span className="hidden lg:inline">{label}</span>
                      <span className="lg:hidden">{short}</span>
                    </h3>
                    {dayTasks.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {completedCount}/{dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {dayTasks.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        Sin tareas
                      </p>
                    ) : (
                      dayTasks.map((task) => (
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
                Sin día asignado
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
