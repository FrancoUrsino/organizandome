export type TaskPriority = 'alta' | 'media' | 'baja'
export type TaskType = 'diaria' | 'semanal' | 'mensual'
export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'
export interface Task {
  id: string
  title: string
  description?: string
  priority: 'alta' | 'media' | 'baja'
  type: 'diaria' | 'semanal' | 'mensual'
  completed: boolean
  createdAt: string
  dayOfWeek?: string
  monthDay?: number
  tags?: string[]
  dueDate?: string 
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
}

export interface DashboardStats {
  diarias: TaskStats
  semanales: TaskStats
  mensuales: TaskStats
}

// Gamification Types
export interface Voucher {
  id: string
  title: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  earnedAt: string
  used: boolean
  usedAt?: string
  priorityRequired?: TaskPriority
}

export interface Streak {
  current: number
  longest: number
  lastCompletedDate: string
  totalDaysCompleted: number
}

export interface DailyProgress {
  date: string
  tasksRequired: number
  tasksCompleted: number
  percentage: number
  milestonesReached: number[]
  vouchersEarned: string[]
}

export interface RewardsData {
  vouchers: Voucher[]
  streak: Streak
  dailyProgress: DailyProgress
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'milestone' | 'streak_warning' | 'streak_lost' | 'voucher_earned' | 'daily_complete'
  title: string
  message: string
  icon: string
  createdAt: string
  read: boolean
}
