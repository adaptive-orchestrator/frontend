import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'info' | 'success' | 'error' | 'warning'

interface ToastItem {
  id: string
  title?: string
  description?: string
  type?: ToastType
  timeout?: number
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Return a no-op if used outside provider (for safety)
    return { push: () => {}, dismiss: () => {} }
  }
  return ctx
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setToasts((s) => [...s, { id, ...toast }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((s) => s.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    toasts.forEach((t) => {
      const ttl = t.timeout ?? 4500
      const timer = setTimeout(() => dismiss(t.id), ttl)
      timers.push(timer)
    })
    return () => timers.forEach(clearTimeout)
  }, [toasts, dismiss])

  const getIcon = (type?: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getStyles = (type?: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white border-green-700'
      case 'error':
        return 'bg-red-600 text-white border-red-700'
      case 'warning':
        return 'bg-yellow-500 text-black border-yellow-600'
      default:
        return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div className="fixed right-4 bottom-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'shadow-xl rounded-xl p-4 text-sm border-2 pointer-events-auto',
              'animate-in slide-in-from-right-full fade-in duration-300',
              getStyles(t.type)
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{getIcon(t.type)}</span>
              <div className="flex-1 min-w-0">
                {t.title && <div className="font-semibold mb-1 break-words">{t.title}</div>}
                {t.description && (
                  <div className="leading-tight opacity-90 text-xs break-all">
                    {t.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
