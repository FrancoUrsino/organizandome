'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Task, TaskPriority, TaskType, DayOfWeek } from '@/types/task'

interface AddTaskFormProps {
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void
  defaultType?: TaskType
}

const daysOfWeek: { value: DayOfWeek; label: string }[] = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
]

export function AddTaskForm({ onAdd, defaultType = 'diaria' }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('media')
  const [type, setType] = useState<TaskType>(defaultType)
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('lunes')
  const [monthDay, setMonthDay] = useState<number>(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    // 1. Creamos el objeto base con los datos obligatorios
    const taskData: Omit<Task, 'id' | 'createdAt' | 'completed'> = {
      title: title.trim(),
      description: description.trim() || "",
      priority,
      type,
    }

    // 2. Solo agregamos el día de la semana si la tarea es semanal
    if (type === 'semanal') {
      taskData.dayOfWeek = dayOfWeek
    } else {
      taskData.dayOfWeek = 'lunes'
    }

    // 3. Solo agregamos el día del mes si la tarea es mensual
    if (type === 'mensual') {
      taskData.monthDay = monthDay
    } else {
      taskData.monthDay = 1
    }

    // 4. Enviamos la tarea limpia a la función onAdd
    onAdd(taskData)

    // Reset form
    setTitle('')
    setDescription('')
    setPriority('media')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-8 md:right-8"
        size="icon"
        aria-label="Agregar nueva tarea"
      >
        <Plus className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300 rounded-t-2xl bg-card p-6 shadow-xl md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nueva Tarea</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar formulario"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Título *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué necesitas hacer?"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
              Descripción
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agrega más detalles (opcional)"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="mb-1.5 block text-sm font-medium">
                Prioridad
              </label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                  <SelectItem value="media">🟡 Media</SelectItem>
                  <SelectItem value="baja">🟢 Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="type" className="mb-1.5 block text-sm font-medium">
                Tipo
              </label>
              <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diaria">Diaria</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === 'semanal' && (
            <div>
              <label htmlFor="dayOfWeek" className="mb-1.5 block text-sm font-medium">
                Día de la semana
              </label>
              <Select value={dayOfWeek} onValueChange={(v) => setDayOfWeek(v as DayOfWeek)}>
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'mensual' && (
            <div>
              <label htmlFor="monthDay" className="mb-1.5 block text-sm font-medium">
                Día del mes
              </label>
              <Select
                value={monthDay.toString()}
                onValueChange={(v) => setMonthDay(parseInt(v))}
              >
                <SelectTrigger id="monthDay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      Día {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!title.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Tarea
          </Button>
        </form>
      </div>
    </div>
  )
}