'use client'

import { useState, useMemo } from 'react'
import { TaskCard } from './task-card'
import type { Task } from '@/types/task'
import { Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  emptyMessage = "No hay tareas registradas" 
}: TaskListProps) {
  
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // 1. Extraemos todas las etiquetas únicas de las tareas que entran a ESTA lista específica
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet)
  }, [tasks])

  // 2. Filtramos las tareas según el botón presionado
  const filteredTasks = useMemo(() => {
    if (!selectedTag) return tasks
    return tasks.filter(task => task.tags?.includes(selectedTag))
  }, [tasks, selectedTag])

  // Si cambiamos de vista o las tareas cambian y el tag seleccionado ya no existe, lo limpiamos
  useMemo(() => {
    if (selectedTag && !allTags.includes(selectedTag)) {
      setSelectedTag(null)
    }
  }, [allTags, selectedTag])

  return (
    <div className="space-y-4">
      {/* 🏷️ BARRA DE FILTROS INTERNA DE TASKLIST */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/30 p-1.5 rounded-xl border border-border/40 my-2 animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedTag(null)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all",
              !selectedTag 
                ? "bg-background text-foreground shadow-sm border border-border/60" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
          
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={cn(
                "flex items-center gap-0.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all border",
                selectedTag === tag
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border-transparent hover:border-border/60"
              )}
            >
              <Hash className="h-2.5 w-2.5 opacity-60" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 📋 LISTADO COMPONENTE */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            {selectedTag 
              ? `No hay tareas con la etiqueta #${selectedTag} en esta sección`
              : emptyMessage
            }
          </div>
        )}
      </div>
    </div>
  )
}