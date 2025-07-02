"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { TemplateStatusCardProps } from "./types"

export function TemplateStatusCard({
  loadedTemplate,
  formData,
  onSwitchConfiguration,
  onClearTemplate,
  themeColors
}: TemplateStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 sm:mb-6"
    >
      <Card className={`${themeColors.cardBg} border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base truncate">
                  Template Applied: {loadedTemplate.name}
                </h3>
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 truncate">
                  Using endpoint: <code className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-xs">{formData.endpoint}</code>
                </p>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onSwitchConfiguration}
                className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/50 text-xs sm:text-sm h-7 sm:h-8"
              >
                <span className="hidden xs:inline">Switch Configuration</span>
                <span className="xs:hidden">Switch</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearTemplate}
                className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm h-7 sm:h-8"
              >
                <span className="hidden xs:inline">Clear Template</span>
                <span className="xs:hidden">Clear</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
