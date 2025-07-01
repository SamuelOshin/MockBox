import { EngineSpinner } from "@/components/ui/engine-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <EngineSpinner size={48} color="#6366f1" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground justify-center">
          <span className="font-bold tracking-tight text-lg text-slate-800 dark:text-slate-100">Loading...</span>
        </div>
      </div>
    </div>
  )
}
