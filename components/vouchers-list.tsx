'use client'

import { useState } from 'react'
import { Gift, Check, Ticket, Sparkles, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Voucher } from '@/types/task'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface VouchersListProps {
  vouchers: Voucher[]
  onUseVoucher: (id: string) => void
}

const tierColors: Record<Voucher['tier'], { bg: string; border: string; text: string; badge: string }> = {
  bronze: {
    bg: 'bg-gradient-to-br from-amber-700/10 to-orange-600/10',
    border: 'border-amber-600/30',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-600',
  },
  silver: {
    bg: 'bg-gradient-to-br from-slate-400/10 to-gray-500/10',
    border: 'border-slate-400/30',
    text: 'text-slate-600 dark:text-slate-300',
    badge: 'bg-slate-500',
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-500/10 to-amber-400/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    badge: 'bg-yellow-500',
  },
  platinum: {
    bg: 'bg-gradient-to-br from-cyan-400/10 to-teal-500/10',
    border: 'border-cyan-400/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-500',
  },
  diamond: {
    bg: 'bg-gradient-to-br from-violet-500/10 to-purple-600/10',
    border: 'border-violet-400/30',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-500',
  },
}

const tierLabels: Record<Voucher['tier'], string> = {
  bronze: 'Bronce',
  silver: 'Plata',
  gold: 'Oro',
  platinum: 'Platino',
  diamond: 'Diamante',
}

export function VouchersList({ vouchers, onUseVoucher }: VouchersListProps) {
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [showUsed, setShowUsed] = useState(false)

  const unusedVouchers = vouchers.filter(v => !v.used)
  const usedVouchers = vouchers.filter(v => v.used)
  const displayVouchers = showUsed ? usedVouchers : unusedVouchers

  const handleUseVoucher = () => {
    if (selectedVoucher) {
      onUseVoucher(selectedVoucher.id)
      setSelectedVoucher(null)
    }
  }

  return (
    <>
      <Card className="border-none bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5 text-primary" />
              Mis Vouchers
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant={showUsed ? 'ghost' : 'secondary'}
                size="sm"
                onClick={() => setShowUsed(false)}
                className="h-7 text-xs"
              >
                <Ticket className="mr-1 h-3 w-3" />
                {unusedVouchers.length}
              </Button>
              <Button
                variant={showUsed ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowUsed(true)}
                className="h-7 text-xs"
              >
                <Check className="mr-1 h-3 w-3" />
                {usedVouchers.length}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {displayVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-4 mb-3">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {showUsed
                  ? 'No has usado ningún voucher aún'
                  : 'Completa tareas para ganar vouchers'}
              </p>
            </div>
          ) : (
            displayVouchers.map(voucher => {
              const colors = tierColors[voucher.tier]
              return (
                <button
                  key={voucher.id}
                  onClick={() => !voucher.used && setSelectedVoucher(voucher)}
                  disabled={voucher.used}
                  className={`w-full text-left transition-all ${
                    voucher.used ? 'opacity-60' : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <div
                    className={`relative overflow-hidden rounded-xl border p-3 ${colors.bg} ${colors.border}`}
                  >
                    {/* Decorative pattern */}
                    <div className="absolute right-0 top-0 h-full w-24 opacity-10">
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-6xl">
                        {voucher.icon}
                      </div>
                    </div>

                    <div className="relative flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 text-xl shrink-0">
                        {voucher.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold truncate">{voucher.title}</h4>
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white ${colors.badge}`}
                          >
                            {tierLabels[voucher.tier]}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {voucher.description}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(voucher.earnedAt), "d 'de' MMM", { locale: es })}
                          {voucher.used && voucher.usedAt && (
                            <span className="ml-2 text-success">
                              Usado el {format(new Date(voucher.usedAt), "d 'de' MMM", { locale: es })}
                            </span>
                          )}
                        </div>
                      </div>
                      {voucher.used && (
                        <div className="absolute right-2 top-2 rounded-full bg-success/20 p-1">
                          <Check className="h-3 w-3 text-success" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Use Voucher Dialog */}
      <Dialog open={!!selectedVoucher} onOpenChange={() => setSelectedVoucher(null)}>
        <DialogContent className="max-w-sm">
          {selectedVoucher && (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto mb-2 text-5xl">{selectedVoucher.icon}</div>
                <DialogTitle>{selectedVoucher.title}</DialogTitle>
                <DialogDescription>{selectedVoucher.description}</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                    tierColors[selectedVoucher.tier].badge
                  }`}
                >
                  Voucher {tierLabels[selectedVoucher.tier]}
                </span>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button onClick={handleUseVoucher} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Usar Voucher
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedVoucher(null)}
                  className="w-full"
                >
                  Guardar para después
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
