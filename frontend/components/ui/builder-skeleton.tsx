import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"

interface BuilderPageSkeletonProps {
  theme: 'light' | 'dark'
}

export function BuilderPageSkeleton({ theme }: BuilderPageSkeletonProps) {
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
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <motion.div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 md:gap-4 mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-md bg-gradient-to-r from-blue-200 to-purple-200" />
              <div>
                <Skeleton className="h-5 md:h-6 w-28 md:w-32 mb-1 bg-gradient-to-r from-slate-300 to-slate-200" />
                <Skeleton className="h-3 w-36 md:w-48 bg-gradient-to-r from-slate-200 to-slate-100" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Skeleton className={`h-8 md:h-9 ${i === 0 ? 'w-16 md:w-20' : i === 1 ? 'w-16 md:w-20' : 'w-20 md:w-24'} bg-gradient-to-r ${
                    i === 0 ? 'from-green-100 to-emerald-100' :
                    i === 1 ? 'from-blue-100 to-indigo-100' :
                    'from-purple-100 to-violet-100'
                  }`} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Left Panel - Configuration Skeleton */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Configure Endpoint Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded-md bg-gradient-to-r from-blue-200 to-purple-200" />
                  <Skeleton className="h-4 md:h-5 w-28 md:w-32 bg-gradient-to-r from-slate-300 to-slate-200" />
                </div>

                <Card className={`${themeColors.cardBg} hover:shadow-lg transition-shadow duration-300`}>
                  <CardHeader className="pb-3 pt-3 px-3 md:px-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full bg-blue-300" />
                      <Skeleton className="h-3 md:h-4 w-32 md:w-36 bg-gradient-to-r from-slate-300 to-slate-200" />
                    </div>
                    <Skeleton className="h-3 w-48 md:w-64 bg-gradient-to-r from-slate-200 to-slate-100" />
                  </CardHeader>
                  <CardContent className="space-y-3 px-3 md:px-4">
                    {/* Mock Name */}
                    <div>
                      <Skeleton className="h-3 w-16 md:w-20 mb-1 bg-gradient-to-r from-slate-300 to-slate-200" />
                      <Skeleton className="h-8 md:h-9 w-full bg-gradient-to-r from-slate-100 to-slate-50" />
                    </div>

                    {/* Method and Path */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Skeleton className="h-3 w-20 md:w-24 mb-1 bg-gradient-to-r from-green-200 to-emerald-200" />
                        <Skeleton className="h-8 md:h-9 w-full bg-gradient-to-r from-green-100 to-emerald-100" />
                      </div>
                      <div>
                        <Skeleton className="h-3 w-12 md:w-16 mb-1 bg-gradient-to-r from-blue-200 to-indigo-200" />
                        <Skeleton className="h-8 md:h-9 w-full bg-gradient-to-r from-blue-100 to-indigo-100" />
                      </div>
                    </div>

                    {/* Status Code and Delay */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Skeleton className="h-3 w-16 md:w-20 mb-1 bg-gradient-to-r from-orange-200 to-amber-200" />
                        <Skeleton className="h-8 md:h-9 w-full bg-gradient-to-r from-orange-100 to-amber-100" />
                      </div>
                      <div>
                        <Skeleton className="h-3 w-12 md:w-16 mb-1 bg-gradient-to-r from-purple-200 to-violet-200" />
                        <Skeleton className="h-8 md:h-9 w-full bg-gradient-to-r from-purple-100 to-violet-100" />
                      </div>
                    </div>

                    {/* Public Toggle */}
                    <div className="p-3 md:p-4 rounded-lg border border-gray-200/50 bg-gradient-to-r from-slate-50 to-slate-25">
                      <div className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-3 w-20 md:w-24 mb-1 bg-gradient-to-r from-slate-300 to-slate-200" />
                          <Skeleton className="h-2 w-28 md:w-32 bg-gradient-to-r from-slate-200 to-slate-100" />
                        </div>
                        <Skeleton className="h-5 md:h-6 w-9 md:w-11 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* JSON Snippets Skeleton */}
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className={`${themeColors.cardBg} overflow-hidden`}>
                    <CardHeader className="pb-2 px-3 md:px-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-200 to-pink-200" />
                        <Skeleton className="h-4 w-20 md:w-24 bg-gradient-to-r from-slate-300 to-slate-200" />
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 md:px-4">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className={`h-12 md:h-16 rounded-lg bg-gradient-to-r ${
                            i === 0 ? 'from-blue-100 to-indigo-100' :
                            i === 1 ? 'from-green-100 to-emerald-100' :
                            i === 2 ? 'from-orange-100 to-amber-100' :
                            'from-purple-100 to-violet-100'
                          }`} />
                        ))}
                      </div>
                      <Skeleton className="h-24 md:h-32 w-full rounded-lg bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100" />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Advanced Options Skeleton */}
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className={`${themeColors.cardBg}`}>
                    <CardHeader className="pb-2 px-3 md:px-4">
                      <Skeleton className="h-4 w-28 md:w-32 bg-gradient-to-r from-slate-300 to-slate-200" />
                    </CardHeader>
                    <CardContent className="space-y-3 px-3 md:px-4">
                      <Skeleton className="h-8 md:h-9 w-full bg-gradient-to-r from-slate-100 to-slate-50" />
                      <Skeleton className="h-5 md:h-6 w-3/4 bg-gradient-to-r from-slate-100 to-slate-50" />
                      <Skeleton className="h-10 md:h-12 w-full bg-gradient-to-r from-slate-100 to-slate-50" />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Panel - Response Editor & Preview Skeleton */}
            <motion.div
              className="space-y-3 md:space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Mock Response Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded-md bg-gradient-to-r from-purple-200 to-pink-200" />
                  <Skeleton className="h-4 md:h-5 w-24 md:w-28 bg-gradient-to-r from-slate-300 to-slate-200" />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className={`${themeColors.cardBg} overflow-hidden`}>
                    <CardHeader className="pb-2 px-3 md:px-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20 md:w-24 bg-gradient-to-r from-slate-300 to-slate-200" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded bg-slate-200" />
                          <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded bg-slate-200" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 md:px-4">
                      {/* Monaco Editor Skeleton */}
                      <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                        <div className="bg-slate-100 p-2 border-b">
                          <div className="flex gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-slate-300" />
                            ))}
                          </div>
                        </div>
                        <div className="p-3 md:p-4 space-y-2">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <Skeleton key={i} className={`h-2 md:h-3 bg-gradient-to-r from-slate-200 to-slate-100 ${
                              i === 0 ? 'w-1/4' :
                              i === 1 || i === 11 ? 'w-1/6' :
                              i === 2 ? 'w-1/3' :
                              i === 3 ? 'w-2/3' :
                              i === 4 ? 'w-1/2' :
                              i === 5 ? 'w-3/4' :
                              i === 6 ? 'w-1/3' :
                              i === 7 ? 'w-2/5' :
                              i === 8 ? 'w-1/2' :
                              i === 9 ? 'w-1/4' :
                              'w-1/3'
                            }`} />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Preview Output Section */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded-lg bg-gradient-to-r from-orange-200 to-red-200" />
                    <Skeleton className="h-4 md:h-5 w-24 md:w-28 bg-gradient-to-r from-slate-300 to-slate-200" />
                  </div>

                  {/* Device Preview Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-lg border border-gray-200/50">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className={`h-5 w-5 md:h-6 md:w-6 rounded ${
                        i === 0 ? 'bg-gradient-to-r from-blue-200 to-indigo-200' :
                        i === 1 ? 'bg-gradient-to-r from-slate-200 to-slate-100' :
                        'bg-gradient-to-r from-slate-200 to-slate-100'
                      }`} />
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className={`${themeColors.cardBg} overflow-hidden`}>
                    <CardHeader className="pb-3 px-3 md:px-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200" />
                        <Skeleton className="h-4 md:h-5 w-20 md:w-24 bg-gradient-to-r from-slate-300 to-slate-200" />
                      </div>
                      <Skeleton className="h-3 w-48 md:w-64 bg-gradient-to-r from-slate-200 to-slate-100" />
                    </CardHeader>
                    <CardContent className="px-3 md:px-4">
                      {/* Tabs */}
                      <div className="flex gap-2 mb-4 p-1 bg-slate-50 rounded-lg overflow-x-auto">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className={`h-7 md:h-8 w-16 md:w-20 rounded-md flex-shrink-0 ${
                            i === 0 ? 'bg-gradient-to-r from-blue-100 to-indigo-100' :
                            'bg-gradient-to-r from-slate-100 to-slate-50'
                          }`} />
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div className="space-y-3">
                        <div>
                          <Skeleton className="h-3 w-12 md:w-16 mb-1 bg-gradient-to-r from-slate-300 to-slate-200" />
                          <Skeleton className="h-8 md:h-9 w-full bg-gradient-to-r from-slate-100 to-slate-50" />
                        </div>
                        <div>
                          <Skeleton className="h-3 w-16 md:w-20 mb-1 bg-gradient-to-r from-slate-300 to-slate-200" />
                          <div className="border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <Skeleton key={i} className={`h-2 md:h-3 mb-2 bg-gradient-to-r from-slate-200 to-slate-100 ${
                                i === 0 ? 'w-1/3' :
                                i === 1 ? 'w-2/3' :
                                i === 2 ? 'w-1/2' :
                                i === 3 ? 'w-3/4' :
                                i === 4 ? 'w-1/4' :
                                'w-1/2'
                              }`} />
                            ))}
                          </div>
                        </div>
                        <Skeleton className="h-6 md:h-7 w-16 md:w-20 bg-gradient-to-r from-blue-100 to-indigo-100" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
