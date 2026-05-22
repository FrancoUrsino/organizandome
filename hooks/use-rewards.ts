'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Voucher, Streak, DailyProgress, Notification, TaskPriority } from '@/types/task'

const REWARDS_KEY = 'bloom-rewards'
const MILESTONES = [20, 40, 60, 80, 100]
const MIN_DAILY_TASKS = 1 // 👈 CAMBIADO DE 5 A 1: Así, si creas 2 tareas y haces las 2, ya es un 100% real y avanza tu racha

// Vouchers pool organized by tier
const VOUCHER_POOL: Record<string, { title: string; description: string; icon: string; tier: Voucher['tier'] }[]> = {
  bronze: [
    { title: 'Descanso Express', description: '15 minutos de descanso sin culpa', icon: '☕', tier: 'bronze' },
    { title: 'Snack Time', description: 'Vale por un snack delicioso', icon: '🍫', tier: 'bronze' },
    { title: 'Scroll Libre', description: '30 minutos de redes sociales sin culpa', icon: '📱', tier: 'bronze' },
  ],
  silver: [
    { title: 'Libre de Platos', description: 'Voucher válido para no lavar los platos hoy', icon: '🍽️', tier: 'silver' },
    { title: 'Siesta Merecida', description: 'Vale por una siesta de 1 hora', icon: '😴', tier: 'silver' },
    { title: 'Delivery Time', description: 'Pedir comida a domicilio sin culpa', icon: '🛵', tier: 'silver' },
  ],
  gold: [
    { title: 'Día de Películas', description: 'Todo un día de películas y series', icon: '🎬', tier: 'gold' },
    { title: 'Shopping Therapy', description: 'Comprarte algo lindo sin culpa', icon: '🛍️', tier: 'gold' },
    { title: 'Spa en Casa', description: 'Tarde de autocuidado y mascarillas', icon: '💆‍♀️', tier: 'gold' },
  ],
  platinum: [
    { title: 'Día de Reina', description: 'Vale por un día de que hagan todo lo que pidas', icon: '👑', tier: 'platinum' },
    { title: 'Cero Responsabilidades', description: 'Un día libre de todas las tareas del hogar', icon: '🎉', tier: 'platinum' },
    { title: 'Brunch Special', description: 'Vale por un brunch fancy', icon: '🥂', tier: 'platinum' },
  ],
  diamond: [
    { title: 'Semana de Reina', description: '¡Toda una semana de privilegios especiales!', icon: '💎', tier: 'diamond' },
    { title: 'Capricho Total', description: 'Cumple un capricho especial sin límites', icon: '✨', tier: 'diamond' },
    { title: 'Escape Perfecto', description: 'Un día completo de hacer lo que quieras', icon: '🌸', tier: 'diamond' },
  ],
}

function getTierForMilestone(milestone: number, highPriorityCount: number): Voucher['tier'] {
  const baseTier = {
    20: 'bronze',
    40: 'silver',
    60: 'gold',
    80: 'platinum',
    100: 'diamond',
  }[milestone] as Voucher['tier']

  if (highPriorityCount >= 3 && baseTier !== 'diamond') {
    const tiers: Voucher['tier'][] = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
    const currentIndex = tiers.indexOf(baseTier)
    return tiers[Math.min(currentIndex + 1, 4)]
  }

  return baseTier
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function getRandomVoucher(tier: Voucher['tier']): Omit<Voucher, 'id' | 'earnedAt' | 'used'> {
  const pool = VOUCHER_POOL[tier]
  return pool[Math.floor(Math.random() * pool.length)]
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function isToday(dateString: string): boolean {
  return dateString === getTodayString()
}

function isYesterday(dateString: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateString === yesterday.toISOString().split('T')[0]
}

interface UseRewardsProps {
  dailyTasks: { id: string; completed: boolean; priority: TaskPriority }[]
}

export function useRewards({ dailyTasks }: UseRewardsProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [streak, setStreak] = useState<Streak>({
    current: 0,
    longest: 0,
    lastCompletedDate: '',
    totalDaysCompleted: 0,
  })
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: getTodayString(),
    tasksRequired: MIN_DAILY_TASKS,
    tasksCompleted: 0,
    percentage: 0,
    milestonesReached: [],
    vouchersEarned: [],
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotification, setShowNotification] = useState<Notification | null>(null)
  const [loaded, setLoaded] = useState(false)
  
  const processedMilestonesRef = useRef<Set<number>>(new Set())
  const lastTasksHashRef = useRef<string>('')

  const tasksHash = dailyTasks.map(t => `${t.id}:${t.completed}`).join(',')

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REWARDS_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        setVouchers(data.vouchers || [])
        
        if (data.streak) {
          setStreak(data.streak)
        }
        
        if (data.dailyProgress && isToday(data.dailyProgress.date)) {
          setDailyProgress(data.dailyProgress)
          processedMilestonesRef.current = new Set(data.dailyProgress.milestonesReached || [])
        } else if (data.streak && data.dailyProgress) {
          const lastDate = data.dailyProgress.date
          
          // Si ayer NO completó el 100%, se limpia la racha al abrir la app hoy
          if (!isYesterday(lastDate) && !isToday(lastDate) && data.streak.current > 0 && data.streak.lastCompletedDate !== lastDate) {
            setStreak(prev => ({ ...prev, current: 0 }))
            setTimeout(() => {
              const notification: Notification = {
                id: generateId(),
                type: 'streak_lost',
                title: '¡Oh no! Racha perdida',
                message: `Perdiste tu racha de ${data.streak.current} días. ¡Comienza de nuevo!`,
                icon: '💔',
                createdAt: new Date().toISOString(),
                read: false,
              }
              setNotifications(prev => [notification, ...prev])
              setShowNotification(notification)
            }, 500)
          }
        }
        
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error loading rewards:', error)
    }
    setLoaded(true)
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    if (!loaded) return
    const data = { vouchers, streak, dailyProgress, notifications }
    localStorage.setItem(REWARDS_KEY, JSON.stringify(data))
  }, [vouchers, streak, dailyProgress, notifications, loaded])

  // Calculate progress when tasks change
  useEffect(() => {
    if (!loaded) return
    if (tasksHash === lastTasksHashRef.current) return
    lastTasksHashRef.current = tasksHash

    const today = getTodayString()
    const completedCount = dailyTasks.filter(t => t.completed).length
    
    // Si no hay tareas creadas todavía, el total requerido para el 100% pasa a ser 1 transitoriamente
    const totalTasks = dailyTasks.length > 0 ? dailyTasks.length : MIN_DAILY_TASKS
    const newPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
    const highPriorityCompleted = dailyTasks.filter(t => t.completed && t.priority === 'alta').length

    setDailyProgress(prev => {
      const isNewDay = prev.date !== today
      if (isNewDay) {
        processedMilestonesRef.current = new Set()
      }
      
      const currentMilestones = isNewDay ? [] : prev.milestonesReached
      const newMilestones: number[] = []
      const newVouchers: Voucher[] = []
      const newNotifications: Notification[] = []

      // Solo procesamos recompensas si efectivamente hay tareas en la lista
      if (dailyTasks.length > 0) {
        MILESTONES.forEach(milestone => {
          if (newPercentage >= milestone && 
              !currentMilestones.includes(milestone) && 
              !processedMilestonesRef.current.has(milestone)) {
            
            processedMilestonesRef.current.add(milestone)
            newMilestones.push(milestone)
            
            const tier = getTierForMilestone(milestone, highPriorityCompleted)
            const voucherData = getRandomVoucher(tier)
            const newVoucher: Voucher = {
              ...voucherData,
              id: generateId(),
              earnedAt: new Date().toISOString(),
              used: false,
            }
            newVouchers.push(newVoucher)

            const milestoneNotification: Notification = {
              id: generateId(),
              type: 'milestone',
              title: `¡${milestone}% completado!`,
              message: `Ganaste: ${newVoucher.title}`,
              icon: newVoucher.icon,
              createdAt: new Date().toISOString(),
              read: false,
            }
            newNotifications.push(milestoneNotification)

            if (milestone === 100) {
              const completeNotification: Notification = {
                id: generateId(),
                type: 'daily_complete',
                title: '¡Día completado!',
                message: '¡Increíble! Completaste todas tus tareas de hoy.',
                icon: '🎊',
                createdAt: new Date().toISOString(),
                read: false,
              }
              newNotifications.push(completeNotification)
            }
          }
        })
      }

      if (newVouchers.length > 0) {
        setTimeout(() => {
          setVouchers(v => [...newVouchers, ...v])
          setNotifications(n => [...newNotifications, ...n])
          if (newNotifications.length > 0) {
            setShowNotification(newNotifications[0])
          }
          
          if (newMilestones.includes(100)) {
            setStreak(s => {
              // Evitamos que sume doble racha si marcas y desmarcas tareas el mismo día
              if (s.lastCompletedDate === today) return s
              
              return {
                current: s.current + 1,
                longest: Math.max(s.current + 1, s.longest),
                lastCompletedDate: today,
                totalDaysCompleted: s.totalDaysCompleted + 1,
              }
            })
          }
        }, 0)
      }

      return {
        date: today,
        tasksRequired: dailyTasks.length,
        tasksCompleted: completedCount,
        percentage: dailyTasks.length > 0 ? newPercentage : 0,
        milestonesReached: isNewDay ? newMilestones : [...currentMilestones, ...newMilestones],
        vouchersEarned: isNewDay ? newVouchers.map(v => v.id) : [...prev.vouchersEarned, ...newVouchers.map(v => v.id)],
      }
    })
  }, [tasksHash, dailyTasks, loaded])

  const dismissNotification = useCallback(() => {
    setShowNotification(null)
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const useVoucher = useCallback((id: string) => {
    setVouchers(prev =>
      prev.map(v =>
        v.id === id ? { ...v, used: true, usedAt: new Date().toISOString() } : v
      )
    )
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    vouchers,
    streak,
    dailyProgress,
    notifications,
    showNotification,
    unreadCount,
    dismissNotification,
    markNotificationRead,
    markAllNotificationsRead,
    useVoucher,
    MILESTONES,
    MIN_DAILY_TASKS,
  }
}