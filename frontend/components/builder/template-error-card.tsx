"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { TemplateErrorCardProps } from "./types"

export function TemplateErrorCard({ error, themeColors }: TemplateErrorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 sm:mb-4"
    >
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <CardContent className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-red-800 dark:text-red-300 text-sm sm:text-base">
              Template Loading Error
            </h3>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-200 mt-1 break-words">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
