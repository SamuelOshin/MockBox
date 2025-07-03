import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"

interface MocksPageSkeletonProps {
  theme: 'light' | 'dark'
}

export function MocksPageSkeleton({ theme }: MocksPageSkeletonProps) {
  const themeColors = {
    cardBg: theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1A1A1A] border-gray-800',
    background: theme === 'light' ? 'bg-slate-50' : 'bg-[#0A0A0A]',
  }

  return (
    <div className={`flex-1 ${themeColors.background} transition-colors duration-200`}>
      <main className="p-6 md:h-[calc(100vh-4rem)] md:overflow-y-auto">
        {/* Header Section Skeleton */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-200 to-purple-200" />
              <Skeleton className="h-9 w-32 bg-gradient-to-r from-slate-300 to-slate-200" />
            </div>
            <Skeleton className="h-5 w-64 bg-gradient-to-r from-slate-200 to-slate-100" />
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Skeleton className="h-10 w-40 bg-gradient-to-r from-blue-100 to-indigo-100" />
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Stats Skeleton */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`${themeColors.cardBg} transition-all duration-300 hover:shadow-lg overflow-hidden`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className={`h-4 w-20 ${
                    index === 0 ? 'bg-gradient-to-r from-blue-200 to-indigo-200' :
                    index === 1 ? 'bg-gradient-to-r from-green-200 to-emerald-200' :
                    index === 2 ? 'bg-gradient-to-r from-orange-200 to-amber-200' :
                    'bg-gradient-to-r from-purple-200 to-violet-200'
                  }`} />
                  <Skeleton className={`h-4 w-4 rounded-full ${
                    index === 0 ? 'bg-blue-300' :
                    index === 1 ? 'bg-green-300' :
                    index === 2 ? 'bg-orange-300' :
                    'bg-purple-300'
                  }`} />
                </CardHeader>
                <CardContent>
                  <Skeleton className={`h-8 w-12 ${
                    index === 0 ? 'bg-gradient-to-r from-blue-300 to-indigo-300' :
                    index === 1 ? 'bg-gradient-to-r from-green-300 to-emerald-300' :
                    index === 2 ? 'bg-gradient-to-r from-orange-300 to-amber-300' :
                    'bg-gradient-to-r from-purple-300 to-violet-300'
                  }`} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters Skeleton */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative flex-1 max-w-sm">
            <Skeleton className="h-10 w-full bg-gradient-to-r from-slate-100 to-slate-50" />
            <div className="absolute left-3 top-3">
              <Skeleton className="h-4 w-4 rounded-full bg-slate-300" />
            </div>
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 bg-gradient-to-r from-violet-100 to-purple-100" />
          </div>
        </motion.div>

        {/* Mocks Table Skeleton */}
        <motion.div
          className={`${themeColors.cardBg} rounded-lg border overflow-hidden`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Table Header */}
          <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-slate-25">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-4 rounded bg-slate-200" />
              <Skeleton className="h-4 w-16 bg-gradient-to-r from-slate-300 to-slate-200" />
              <Skeleton className="h-4 w-20 bg-gradient-to-r from-slate-300 to-slate-200" />
              <Skeleton className="h-4 w-24 bg-gradient-to-r from-slate-300 to-slate-200" />
              <Skeleton className="h-4 w-16 bg-gradient-to-r from-slate-300 to-slate-200" />
              <Skeleton className="h-4 w-20 bg-gradient-to-r from-slate-300 to-slate-200" />
              <Skeleton className="h-4 w-28 bg-gradient-to-r from-slate-300 to-slate-200" />
              <Skeleton className="h-4 w-8 bg-gradient-to-r from-slate-300 to-slate-200" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                className="p-4 hover:bg-slate-25 transition-colors duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.005 }}
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4 rounded bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24 bg-gradient-to-r from-slate-300 to-slate-200" />
                    <Skeleton className={`h-3 w-3 rounded-full ${
                      index % 2 === 0 ? 'bg-green-300' : 'bg-red-300'
                    }`} />
                  </div>
                  <Skeleton className={`h-6 w-16 rounded-full ${
                    index % 4 === 0 ? 'bg-gradient-to-r from-green-200 to-emerald-200' :
                    index % 4 === 1 ? 'bg-gradient-to-r from-blue-200 to-indigo-200' :
                    index % 4 === 2 ? 'bg-gradient-to-r from-orange-200 to-amber-200' :
                    'bg-gradient-to-r from-purple-200 to-violet-200'
                  }`} />
                  <Skeleton className="h-4 w-32 bg-gradient-to-r from-slate-200 to-slate-100" />
                  <Skeleton className={`h-6 w-12 rounded-full ${
                    index % 3 === 0 ? 'bg-gradient-to-r from-green-200 to-emerald-200' :
                    'bg-gradient-to-r from-red-200 to-pink-200'
                  }`} />
                  <Skeleton className="h-4 w-8 bg-slate-200" />
                  <Skeleton className="h-4 w-20 bg-slate-200" />
                  <Skeleton className="h-8 w-8 rounded bg-gradient-to-r from-slate-200 to-slate-100" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
