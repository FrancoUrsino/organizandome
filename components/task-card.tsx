'use client'

import { useState } from 'react'
import { Check, Trash2, Edit3, ChevronDown, ChevronUp, GripVertical, Clock } from 'lucide-react' 
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Task, TaskPriority } from '@/types/task'

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

const priorityColors: Record<TaskPriority, { bg: string; text: string; border: string }> = {
  alta: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
  media: { bg: 'bg-warning/10', text: 'text-warning-foreground', border: 'border-warning/30' },
  baja: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
}

const priorityLabels: Record<TaskPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export function TaskCard({ task, onToggle, onDelete, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditTitle(task.title)
      setIsEditing(false)
    }
  }

  const priority = priorityColors[task.priority]

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md',
        task.completed && 'opacity-60',
        priority.border
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            task.completed
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30 hover:border-primary'
          )}
          aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm"
              autoFocus
            />
          ) : (
            <h3
              className={cn(
                'text-sm font-medium leading-tight',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </h3>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                priority.bg,
                priority.text
              )}
            >
              {priorityLabels[task.priority]}
            </span>

            {task.dayOfWeek && (
              <span className="text-xs text-muted-foreground capitalize">
                {task.dayOfWeek}
              </span>
            )}

            {task.monthDay && (
              <span className="text-xs text-muted-foreground">
                Día {task.monthDay}
              </span>
            )}

            {task.tags && task.tags.map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/40 tracking-wide"
              >
                #{tag}
              </span>
            ))}

            {task.createdAt && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/80 font-normal bg-muted/40 px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3 text-muted-foreground/60" />
                {new Date(task.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })} a las {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
              </span>
            )}
          </div>

          {task.description && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Ocultar descripción
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Ver descripción
                  </>
                )}
              </button>
              {isExpanded && (
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
            aria-label="Editar tarea"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(task.id)}
            aria-label="Eliminar tarea"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}