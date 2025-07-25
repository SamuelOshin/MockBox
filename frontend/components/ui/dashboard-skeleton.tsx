import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"

interface DashboardSkeletonProps {
  theme: 'light' | 'dark'
}

export function DashboardSkeleton({ theme }: DashboardSkeletonProps) {
  const themeColors = {
    cardBg: theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1A1A1A] border-gray-800',
    background: theme === 'light' ? 'bg-gradient-to-br from-slate-50 via-white to-slate-100' : 'bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#1A1A1A]',
    text: theme === 'light' ? 'text-slate-900' : 'text-white',
  }

  return (
    <div className={`flex-1 min-h-screen ${themeColors.background} ${themeColors.text} md:overflow-hidden transition-colors duration-200 relative`}>
      <div className="hidden md:block">
        {/* Header placeholder */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-800" />
      </div>
      
      <main className="max-w-7xl mx-auto py-4 md:py-8 px-3 sm:px-4 md:px-6 h-screen md:h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden relative z-10">
        {/* Welcome Section Skeleton */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100" />
            <Skeleton className="h-8 md:h-10 w-48 sm:w-64 md:w-80 bg-gradient-to-r from-slate-200 to-slate-100" />
          </div>
          <Skeleton className="h-5 md:h-6 w-64 sm:w-80 md:w-96 mb-4 md:mb-6 bg-gradient-to-r from-slate-100 to-slate-50" />

          {/* Quick Actions Skeleton */}
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Skeleton className={`h-9 md:h-10 ${i === 0 ? 'w-28 sm:w-40' : i === 1 ? 'w-24 sm:w-32' : 'w-20 sm:w-28'} bg-gradient-to-r from-blue-100 to-indigo-100`} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics Skeleton */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`${themeColors.cardBg} transition-all duration-300 hover:shadow-lg overflow-hidden`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-100" />
                  <Skeleton className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-200 to-purple-200" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2 bg-gradient-to-r from-slate-300 to-slate-200" />
                  <Skeleton className="h-3 w-32 bg-gradient-to-r from-green-100 to-emerald-100" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mocks Table Header Skeleton */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <Skeleton className="h-6 md:h-7 w-20 md:w-24 mb-2 bg-gradient-to-r from-slate-300 to-slate-200" />
            <Skeleton className="h-4 w-40 md:w-48 bg-gradient-to-r from-slate-200 to-slate-100" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 md:h-10 w-16 md:w-20 bg-gradient-to-r from-orange-100 to-amber-100" />
            <Skeleton className="h-9 md:h-10 w-24 md:w-32 bg-gradient-to-r from-blue-100 to-indigo-100" />
          </div>
        </motion.div>

        {/* Search and Filters Skeleton */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative flex-1">
            <Skeleton className="h-9 md:h-10 w-full bg-gradient-to-r from-slate-100 to-slate-50" />
            <div className="absolute left-3 top-2 md:top-3">
              <Skeleton className="h-4 w-4 rounded-full bg-slate-300" />
            </div>
          </div>
          <Skeleton className="h-9 md:h-10 w-24 md:w-32 bg-gradient-to-r from-violet-100 to-purple-100" />
        </motion.div>

        {/* Mocks Table Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Desktop Table View */}
          <Card className={`${themeColors.cardBg} transition-colors duration-200 overflow-hidden hidden md:block`}>
            <div className="p-6">
              {/* Table Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/50">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4 rounded bg-slate-200" />
                  <Skeleton className="h-4 w-16 bg-gradient-to-r from-green-200 to-emerald-200" />
                  <Skeleton className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-100" />
                  <Skeleton className="h-4 w-20 bg-gradient-to-r from-amber-200 to-orange-200" />
                  <Skeleton className="h-4 w-28 bg-gradient-to-r from-blue-200 to-indigo-200" />
                  <Skeleton className="h-4 w-20 bg-gradient-to-r from-purple-200 to-violet-200" />
                </div>
              </div>

              {/* Table Rows */}
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200/50 hover:shadow-sm transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Skeleton className="h-4 w-4 rounded bg-slate-200" />
                    <Skeleton className={`h-6 w-16 rounded-full ${
                      index === 0 ? 'bg-gradient-to-r from-green-200 to-emerald-200' :
                      index === 1 ? 'bg-gradient-to-r from-blue-200 to-indigo-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-200 to-amber-200' :
                      index === 3 ? 'bg-gradient-to-r from-red-200 to-pink-200' :
                      'bg-gradient-to-r from-purple-200 to-violet-200'
                    }`} />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1 bg-gradient-to-r from-slate-300 to-slate-200" />
                      <Skeleton className="h-3 w-48 bg-gradient-to-r from-slate-200 to-slate-100" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full bg-gradient-to-r from-green-200 to-emerald-200" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full bg-blue-200" />
                      <Skeleton className="h-4 w-8 bg-slate-200" />
                    </div>
                    <Skeleton className="h-4 w-20 bg-slate-200" />
                    <Skeleton className="h-6 w-16 rounded-full bg-gradient-to-r from-indigo-200 to-purple-200" />
                    <Skeleton className="h-8 w-8 rounded bg-gradient-to-r from-slate-200 to-slate-100" />
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              >
                <Card className={`${themeColors.cardBg} transition-colors duration-200`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <Skeleton className="h-4 w-4 rounded bg-slate-200" />
                        <Skeleton className={`h-6 w-16 rounded-full ${
                          index === 0 ? 'bg-gradient-to-r from-green-200 to-emerald-200' :
                          index === 1 ? 'bg-gradient-to-r from-blue-200 to-indigo-200' :
                          'bg-gradient-to-r from-orange-200 to-amber-200'
                        }`} />
                      </div>
                      <Skeleton className="h-8 w-8 rounded bg-gradient-to-r from-slate-200 to-slate-100" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-slate-300 to-slate-200" />
                      <Skeleton className="h-3 w-full bg-gradient-to-r from-slate-200 to-slate-100" />
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-12 rounded-full bg-gradient-to-r from-green-200 to-emerald-200" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4 rounded-full bg-blue-200" />
                          <Skeleton className="h-4 w-8 bg-slate-200" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full bg-gradient-to-r from-indigo-200 to-purple-200" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
