'use client'

import { X, Gift, Flame, Bell, Trophy, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Notification as NotificationType } from '@/types/task'

interface NotificationToastProps {
  notification: NotificationType
  onDismiss: () => void
}

const iconMap: Record<NotificationType['type'], React.ReactNode> = {
  milestone: <Trophy className="h-5 w-5" />,
  streak_warning: <Flame className="h-5 w-5" />,
  streak_lost: <Flame className="h-5 w-5" />,
  voucher_earned: <Gift className="h-5 w-5" />,
  daily_complete: <Sparkles className="h-5 w-5" />,
}

const bgColorMap: Record<NotificationType['type'], string> = {
  milestone: 'from-primary/20 to-secondary/20 border-primary/30',
  streak_warning: 'from-warning/20 to-orange-500/20 border-warning/30',
  streak_lost: 'from-destructive/20 to-red-500/20 border-destructive/30',
  voucher_earned: 'from-success/20 to-emerald-500/20 border-success/30',
  daily_complete: 'from-accent/20 to-pink-500/20 border-accent/30',
}

const iconColorMap: Record<NotificationType['type'], string> = {
  milestone: 'text-primary',
  streak_warning: 'text-warning',
  streak_lost: 'text-destructive',
  voucher_earned: 'text-success',
  daily_complete: 'text-accent',
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 md:bottom-8 md:left-auto md:right-8 md:w-96">
      <Card className={`overflow-hidden border bg-gradient-to-r ${bgColorMap[notification.type]}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-full bg-background/80 p-2 ${iconColorMap[notification.type]}`}>
              {notification.icon ? (
                <span className="text-lg">{notification.icon}</span>
              ) : (
                iconMap[notification.type]
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground">{notification.title}</h4>
              <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
