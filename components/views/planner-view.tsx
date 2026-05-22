'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  Zap, 
  Users, 
  Layers 
} from 'lucide-react'
import type { Task } from '@/types/task'

interface PlannerViewProps {
  tasks: Task[]
}

type Step = 'selection' | 'questionnaire' | 'result'

interface TaskAnswers {
  currentPriority: 'urgente_importante' | 'importante_no_urgente' | 'solo_urgente' | 'rutina'
  estimatedTime: number // en minutos
  dueDate?: string
  simultaneous: boolean
  energyRequired: 'alta' | 'media' | 'baja'
  dependsOnThirdParty: boolean
}

interface PlannedTask extends Task {
  answers: TaskAnswers
  score: number
  startTime: string
  endTime: string
}

export function PlannerView({ tasks }: PlannerViewProps) {
  const [step, setStep] = useState<Step>('selection')
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, TaskAnswers>>({})
  const [optimizedPlan, setOptimizedPlan] = useState<PlannedTask[]>([])

  // Filtrar solo las tareas pendientes actuales
  const pendingTasks = tasks.filter(t => !t.completed)

  const handleToggleSelect = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    )
  }

  const handleInitQuestionnaire = () => {
    // Inicializar respuestas por defecto para las tareas seleccionadas
    const initialAnswers: Record<string, TaskAnswers> = {}
    selectedTaskIds.forEach(id => {
      initialAnswers[id] = {
        currentPriority: 'importante_no_urgente',
        estimatedTime: 30,
        simultaneous: false,
        energyRequired: 'media',
        dependsOnThirdParty: false,
      }
    })
    setAnswers(initialAnswers)
    setStep('questionnaire')
  }

  const handleAnswerChange = (taskId: string, field: keyof TaskAnswers, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }))
  }

  const generateOptimizedPlan = () => {
    const selectedTasks = pendingTasks.filter(t => selectedTaskIds.includes(t.id))
    
    // 1. Calcular puntuación para cada tarea basada en las respuestas
    const tasksWithScores = selectedTasks.map(task => {
      const ans = answers[task.id]
      let score = 0

      // Prioridad percibida
      if (ans.currentPriority === 'urgente_importante') score += 100
      if (ans.currentPriority === 'solo_urgente') score += 70
      if (ans.currentPriority === 'importante_no_urgente') score += 50
      if (ans.currentPriority === 'rutina') score += 20

      // Nivel de energía requerido (mejor hacer alta energía primero)
      if (ans.energyRequired === 'alta') score += 30
      if (ans.energyRequired === 'media') score += 15

      // Si depende de un tercero, bajar prioridad transitoria porque puede trabarse
      if (ans.dependsOnThirdParty) score -= 40

      // Si se puede hacer en simultáneo, le da flexibilidad adaptativa
      if (ans.simultaneous) score += 10

      return {
        ...task,
        answers: ans,
        score
      }
    })

    // 2. Ordenar de mayor a menor puntuación
    const sortedTasks = [...tasksWithScores].sort((a, b) => b.score - a.score)

    // 3. Construir el cronograma dinámico a partir de la hora actual
    let currentCursor = new Date()
    
    const finalPlan: PlannedTask[] = sortedTasks.map((task) => {
      const startStr = currentCursor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      // Sumar tiempo estimado
      currentCursor = new Date(currentCursor.getTime() + task.answers.estimatedTime * 60000)
      const endStr = currentCursor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      // Agregar pequeño colchón / break automático de 5 minutos para el bloque siguiente
      currentCursor = new Date(currentCursor.getTime() + 5 * 60000)

      return {
        ...task,
        startTime: startStr,
        endTime: endStr
      }
    })

    setOptimizedPlan(finalPlan)
    setStep('result')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-1 animate-in fade-in duration-300">
      {/* Encabezado Principal */}
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Planificador Inteligente</h1>
          <p className="text-sm text-muted-foreground">Modo Enfoque: Diseña tu ruta de acción perfecta</p>
        </div>
      </div>

      {/* PASO 1: SELECCIÓN DE TAREAS */}
      {step === 'selection' && (
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-xl text-sm text-muted-foreground">
            Selecciona las tareas que queres organizar para tu bloque de trabajo actual.
          </div>
          
          {pendingTasks.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">No tenes tareas pendientes para planificar. 🎉</p>
          ) : (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {pendingTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => handleToggleSelect(task.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedTaskIds.includes(task.id) 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border bg-card hover:bg-accent/50'
                  }`}
                >
                  <Checkbox 
                    id={task.id} 
                    checked={selectedTaskIds.includes(task.id)}
                    onCheckedChange={() => handleToggleSelect(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium leading-none capitalize">{task.title}</p>
                    {task.description && <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>}
                    <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground mt-1">
                      {task.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button 
            className="w-full h-11 text-sm font-medium" 
            disabled={selectedTaskIds.length === 0}
            onClick={handleInitQuestionnaire}
          >
            Comenzar Planificación ({selectedTaskIds.length})
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* PASO 2: CUESTIONARIO DINÁMICO */}
      {step === 'questionnaire' && (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setStep('selection')} className="-ml-2 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a selección
          </Button>

          <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2">
            {pendingTasks.filter(t => selectedTaskIds.includes(t.id)).map((task, index) => (
              <div key={task.id} className="p-4 rounded-xl border border-border bg-card space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold capitalize truncate">{task.title}</h3>
                </div>

                {/* Pregunta 1: Prioridad de Enfoque */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-yellow-500" /> Prioridad percibida hoy</label>
                  <Select 
                    value={answers[task.id]?.currentPriority} 
                    onValueChange={(v) => handleAnswerChange(task.id, 'currentPriority', v)}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgente_importante">🔴 Urgente e Importante</SelectItem>
                      <SelectItem value="importante_no_urgente">🟡 Importante pero NO Urgente</SelectItem>
                      <SelectItem value="solo_urgente">🔵 Solo Urgente</SelectItem>
                      <SelectItem value="rutina">🟢 Rutina / Tarea menor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pregunta 2 y 5: Tiempo y Energía */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-blue-500" /> Minutos estimados</label>
                    <Input 
                      type="number" 
                      min={5}
                      value={answers[task.id]?.estimatedTime || 30}
                      onChange={(e) => handleAnswerChange(task.id, 'estimatedTime', parseInt(e.target.value) || 0)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium flex items-center gap-1.5"><BrainCircuit className="h-3.5 w-3.5 text-purple-500" /> Energía mental</label>
                    <Select 
                      value={answers[task.id]?.energyRequired} 
                      onValueChange={(v) => handleAnswerChange(task.id, 'energyRequired', v)}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">⚡ Alta Concentración</SelectItem>
                        <SelectItem value="media">🧠 Media</SelectItem>
                        <SelectItem value="baja">☕ Baja / Mecánica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pregunta 3: Fecha límite */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-orange-500" /> Fecha de entrega (Opcional)</label>
                  <Input 
                    type="date" 
                    value={answers[task.id]?.dueDate || ''}
                    onChange={(e) => handleAnswerChange(task.id, 'dueDate', e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                {/* Pregunta 4 y 6: Simultaneidad y Dependencia */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="flex items-center justify-between border p-2 rounded-lg bg-muted/30">
                    <span className="text-xs font-medium flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-teal-500" /> ¿Multitarea?</span>
                    <Switch 
                      checked={answers[task.id]?.simultaneous || false} 
                      onCheckedChange={(v) => handleAnswerChange(task.id, 'simultaneous', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between border p-2 rounded-lg bg-muted/30">
                    <span className="text-xs font-medium flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-indigo-500" /> ¿Terceros?</span>
                    <Switch 
                      checked={answers[task.id]?.dependsOnThirdParty || false} 
                      onCheckedChange={(v) => handleAnswerChange(task.id, 'dependsOnThirdParty', v)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full h-11 text-sm bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90" onClick={generateOptimizedPlan}>
            <Sparkles className="mr-2 h-4 w-4" /> Calcular Ruta de Enfoque Óptima
          </Button>
        </div>
      )}

      {/* PASO 3: ENFOQUE Y CRONOGRAMA RESULTANTE */}
      {step === 'result' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 to-indigo-500/5 p-4 rounded-xl border border-primary/20 space-y-1.5">
            <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> ¡Estrategia calculada con éxito!
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Se priorizaron las tareas dependiendo tu energía y urgencia real. Las tareas bloqueadas por terceros se posicionaron estratégicamente al final, y agregamos descansos automáticos de 5 minutos entre bloques.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Cronograma Recomendado</h4>
            
            <div className="relative border-l-2 border-muted pl-4 ml-2 space-y-4">
              {optimizedPlan.map((task, index) => (
                <div key={task.id} className="relative group">
                  {/* Punto indicador temporal */}
                  <div className="absolute -left-[21px] top-1 flex h-2 w-2 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                  
                  <div className="bg-card p-3.5 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {task.startTime} - {task.endTime}
                        </span>
                        {task.answers.simultaneous && (
                          <span className="text-[10px] bg-teal-500/10 text-teal-600 px-1.5 rounded-full font-medium">Permite Simultaneidad</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-card-foreground capitalize">{task.title}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {task.answers.estimatedTime} min</span>
                      <span className="capitalize px-2 py-0.5 rounded bg-muted font-medium text-[10px]">
                        Energía {task.answers.energyRequired}
                      </span>
                    </div>
                  </div>

                  {/* Bloque de descanso implícito visual */}
                  {index < optimizedPlan.length - 1 && (
                    <div className="text-[11px] text-muted-foreground/70 my-1 pl-2 flex items-center gap-1.5 italic">
                      <Clock className="h-3 w-3" /> Colchón / Descanso de 5 min
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 text-xs" onClick={() => setStep('selection')}>
            Reiniciar Planificador de Enfoque
          </Button>
        </div>
      )}
    </div>
  )
}