'use client'

import { TaskCard } from '@/components/task-card'
import type { Task } from '@/types/task'
import { ListTodo } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  emptyMessage?: string
}

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdate,
  emptyMessage = 'Todavía no hay tareas',
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <ListTodo className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Usa el botón + para agregar tu primera tarea
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}
