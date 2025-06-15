"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  User,
  Settings,
  HelpCircle,
  Plus,
  Monitor,
  ChevronDown
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/components/ui/theme-provider"
import { motion } from "framer-motion"

export function Header() {
  const { theme, setTheme, actualTheme } = useTheme()

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor }
  ]

  const currentThemeOption = themeOptions.find(option => option.value === theme)

  return (
    <header className="h-16 bg-[#1A1A1A] border-b border-gray-800 flex items-center justify-between px-6">
      
      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search mocks..."
            className="pl-10 bg-[#2D2D2D] border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-[#2D2D2D] h-9 w-9 p-0"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Enhanced Theme Toggle Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-[#2D2D2D] h-9 px-3 gap-2"
            >
              <motion.div
                key={actualTheme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {actualTheme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </motion.div>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#2D2D2D] border-gray-700 w-40">
            {themeOptions.map((option) => {
              const Icon = option.icon
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTheme(option.value as any)}
                  className={`text-white hover:bg-[#3A3A3A] cursor-pointer flex items-center gap-2 ${
                    theme === option.value ? 'bg-[#3A3A3A]' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                  {theme === option.value && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-[#2D2D2D] h-9 w-9 p-0"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">2</span>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">JD</span>
          </div>
        </div>
      </div>
    </header>
  )
}