'use client'

import { Flame, Target, Trophy, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Streak, DailyProgress } from '@/types/task'

interface StreakDisplayProps {
  streak: Streak
  dailyProgress: DailyProgress
  milestones: number[]
}

export function StreakDisplay({ streak, dailyProgress, milestones }: StreakDisplayProps) {
  const nextMilestone = milestones.find(m => m > dailyProgress.percentage) || 100
  const progressToNext = dailyProgress.percentage

  return (
    <div className="space-y-4">
      {/* Streak Card */}
      <Card className="overflow-hidden border-none bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-2.5 text-white">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Racha actual</p>
                <p className="text-2xl font-bold">{streak.current} días</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Mejor racha</p>
              <p className="font-semibold text-primary">{streak.longest} días</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Progress Card */}
      <Card className="border-none bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Progreso de hoy</span>
            </div>
            <span className="text-sm font-bold text-primary">{dailyProgress.percentage}%</span>
          </div>

          {/* Progress bar with milestones */}
          <div className="relative">
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500"
                style={{ width: `${dailyProgress.percentage}%` }}
              />
            </div>
            
            {/* Milestone markers */}
            <div className="absolute inset-0 flex items-center">
              {milestones.map(milestone => (
                <div
                  key={milestone}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${milestone}%` }}
                >
                  <div
                    className={`h-4 w-4 -ml-2 rounded-full border-2 transition-all ${
                      dailyProgress.milestonesReached.includes(milestone)
                        ? 'bg-success border-success scale-110'
                        : dailyProgress.percentage >= milestone
                        ? 'bg-primary border-primary'
                        : 'bg-background border-muted-foreground/30'
                    }`}
                  >
                    {dailyProgress.milestonesReached.includes(milestone) && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs">
                        🎁
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-warning" />
              <span className="text-muted-foreground">
                {dailyProgress.tasksCompleted}/{dailyProgress.tasksRequired} tareas
              </span>
            </div>
            {dailyProgress.percentage < 100 && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-secondary" />
                <span className="text-muted-foreground">
                  Próximo: {nextMilestone}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
