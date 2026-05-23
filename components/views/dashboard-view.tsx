'use client'

import { CalendarDays, Calendar, CalendarRange, CheckCircle2, Circle, TrendingUp, Gift, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StreakDisplay } from '@/components/streak-display'
import { VouchersList } from '@/components/vouchers-list'
import { HistoryCalendar } from '@/components/views/history-calendar'
import type { DashboardStats, Streak, DailyProgress, Voucher, Task } from '@/types/task'

interface DashboardViewProps {
  stats: DashboardStats
  streak: Streak
  dailyProgress: DailyProgress
  milestones: number[]
  vouchers: Voucher[]
  onUseVoucher: (id: string) => void
  tasks: Task[]
}

export function DashboardView({
  stats,
  streak,
  dailyProgress,
  milestones,
  vouchers,
  onUseVoucher,
  tasks,
}: DashboardViewProps) {
  const totalTasks = stats.diarias.total + stats.semanales.total + stats.mensuales.total
  const totalCompleted = stats.diarias.completed + stats.semanales.completed + stats.mensuales.completed
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

  const statCards = [
    {
      title: 'Tareas Diarias',
      icon: CalendarDays,
      stats: stats.diarias,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Tareas Semanales',
      icon: Calendar,
      stats: stats.semanales,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Tareas Mensuales',
      icon: CalendarRange,
      stats: stats.mensuales,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
  ]

  const unusedVouchersCount = vouchers.filter(v => !v.used).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">¡Bienvenida!</h1>
        <p className="text-muted-foreground">
          Acá podes ver tu progreso y recompensas.
        </p>
      </div>

      {/* Streak and Progress */}
      <StreakDisplay streak={streak} dailyProgress={dailyProgress} milestones={milestones} />

      {/* Vouchers Quick Preview */}
      {unusedVouchersCount > 0 && (
        <Card className="border-accent/30 bg-gradient-to-r from-accent/10 to-secondary/10">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-accent/20 p-2">
              <Gift className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                Tenes {unusedVouchersCount} voucher{unusedVouchersCount > 1 ? 's' : ''} disponible{unusedVouchersCount > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">¡Espero que te olvides de usarlos jeje!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NUEVA SECCIÓN: HISTORIAL DE VICTORIAS (ÚLTIMOS 30 DÍAS) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pl-1">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Tu Camino de Victorias
          </h2>
        </div>
        <HistoryCalendar tasks={tasks} />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ title, icon: Icon, stats: cardStats, color, bgColor }) => (
          <Card key={title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <div className={`rounded-lg p-2 ${bgColor}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cardStats.total}</div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span className="text-muted-foreground">{cardStats.completed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Circle className="h-3.5 w-3.5 text-warning" />
                  <span className="text-muted-foreground">{cardStats.pending}</span>
                </div>
              </div>
              {cardStats.total > 0 && (
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(cardStats.completed / cardStats.total) * 100}%`,
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vouchers List */}
      <VouchersList vouchers={vouchers} onUseVoucher={onUseVoucher} />
      
    </div>
  )
}