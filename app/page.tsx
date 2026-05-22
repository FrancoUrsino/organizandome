'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { BottomNav, ViewType } from '@/components/bottom-nav'
import { Sidebar } from '@/components/sidebar'
import { AddTaskForm } from '@/components/add-task-form'
import { DashboardView } from '@/components/views/dashboard-view'
import { DailyView } from '@/components/views/daily-view'
import { WeeklyView } from '@/components/views/weekly-view'
import { MonthlyView } from '@/components/views/monthly-view'
import { NotificationToast } from '@/components/notification-toast'
import { useTasks } from '@/hooks/use-tasks'
import { useRewards } from '@/hooks/use-rewards'
import type { TaskType } from '@/types/task'
import { PlannerView } from '@/components/views/planner-view'

// 1. Agregamos la propiedad 'planificador' para cumplir con el tipo estricto Record<ViewType, ...>
const viewToTaskType: Record<ViewType, TaskType | undefined> = {
  dashboard: undefined,
  diarias: 'diaria',
  semanal: 'semanal',
  mensual: 'mensual',
  planificador: undefined, // 👈 Corrección de la advertencia subrayada
}

export default function HomePage() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const {
    tasks,
    loading,
    useFirebase,
    addTask,
    toggleComplete,
    deleteTask,
    updateTask,
    getTasksByType,
    getStats,
  } = useTasks()

  const dailyTasks = getTasksByType('diaria').map(t => ({
    id: t.id,
    completed: t.completed,
    priority: t.priority,
  }))

  const {
    vouchers,
    streak,
    dailyProgress,
    showNotification,
    unreadCount,
    dismissNotification,
    useVoucher,
    MILESTONES,
  } = useRewards({ dailyTasks })

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            stats={getStats()}
            streak={streak}
            dailyProgress={dailyProgress}
            milestones={MILESTONES}
            vouchers={vouchers}
            onUseVoucher={useVoucher}
          />
        )
      case 'diarias':
        return (
          <DailyView
            tasks={getTasksByType('diaria')}
            onToggle={toggleComplete}
            onDelete={deleteTask}
            onUpdate={updateTask}
            dailyProgress={dailyProgress}
            streak={streak}
          />
        )
      case 'semanal':
        return (
          <WeeklyView
            tasks={getTasksByType('semanal')}
            onToggle={toggleComplete}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
        )
      case 'mensual':
        return (
          <MonthlyView
            tasks={getTasksByType('mensual')}
            onToggle={toggleComplete}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
        )
      case 'planificador':
        return (
          <PlannerView 
            tasks={tasks}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header useFirebase={useFirebase} streak={streak.current} unreadNotifications={unreadCount} />

      <div className="flex flex-1">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Cargando tareas...</p>
                </div>
              </div>
            ) : (
              renderView()
            )}
          </div>
        </main>
      </div>

      <BottomNav activeView={activeView} onViewChange={setActiveView} />

      {!loading && (
        <AddTaskForm
          onAdd={addTask}
          // 2. Si da undefined (como en dashboard o planificador), forzamos que use 'diaria' por defecto
          defaultType={viewToTaskType[activeView] || 'diaria'} 
        />
      )}

      {/* Notification Toast */}
      {showNotification && (
        <NotificationToast
          notification={showNotification}
          onDismiss={dismissNotification}
        />
      )}
    </div>
  )
}