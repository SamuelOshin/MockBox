"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  ChevronDown,
  LogOut
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/components/ui/theme-provider"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Header() {
  const { theme, setTheme, actualTheme } = useTheme()
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor }
  ]

  const currentThemeOption = themeOptions.find(option => option.value === theme)

  // Theme-aware colors
  const headerColors = {
    background: actualTheme === 'dark' ? '#1A1A1A' : '#ffffff',
    border: actualTheme === 'dark' ? 'border-gray-800' : 'border-gray-200',
    searchBg: actualTheme === 'dark' ? '#1A1A1A' : '#f8f9fa',
    searchBorder: actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-300',
    searchText: actualTheme === 'dark' ? 'text-white' : 'text-gray-900',
    searchPlaceholder: actualTheme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500',
    searchIcon: actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    buttonText: actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    buttonHoverText: actualTheme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900',
    buttonHoverBg: actualTheme === 'dark' ? 'hover:bg-[#2D2D2D]' : 'hover:bg-gray-100',
    dropdownBg: actualTheme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-white',
    dropdownBorder: actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    dropdownItemText: actualTheme === 'dark' ? 'text-white' : 'text-gray-900',
    dropdownItemHover: actualTheme === 'dark' ? 'hover:bg-[#3A3A3A]' : 'hover:bg-gray-100',
    dropdownItemActive: actualTheme === 'dark' ? 'bg-[#3A3A3A]' : 'bg-gray-100',
    divider: actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
  }

  return (
    <header className={`h-16 border-b ${headerColors.border} flex items-center justify-between px-6 transition-colors duration-200`} style={{ backgroundColor: headerColors.background }}>
        {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${headerColors.searchIcon}`} />
          <Input
            placeholder="Search mocks..."
            className={`pl-10 ${headerColors.searchBorder} ${headerColors.searchText} ${headerColors.searchPlaceholder} focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200`}
            style={{ backgroundColor: headerColors.searchBg }}
          />
        </div>
      </div>      
      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className={`${headerColors.buttonText} ${headerColors.buttonHoverText} ${headerColors.buttonHoverBg} h-9 w-9 p-0 transition-colors duration-200`}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>        
        {/* Enhanced Theme Toggle Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${headerColors.buttonText} ${headerColors.buttonHoverText} ${headerColors.buttonHoverBg} h-9 px-3 gap-2 transition-colors duration-200`}
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
          <DropdownMenuContent align="end" className={`${headerColors.dropdownBg} ${headerColors.dropdownBorder} w-40`}>
            {themeOptions.map((option) => {
              const Icon = option.icon
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTheme(option.value as any)}
                  className={`${headerColors.dropdownItemText} ${headerColors.dropdownItemHover} cursor-pointer flex items-center gap-2 transition-colors duration-200 ${
                    theme === option.value ? headerColors.dropdownItemActive : ''
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
        </DropdownMenu>        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={`${headerColors.buttonText} ${headerColors.buttonHoverText} ${headerColors.buttonHoverBg} h-9 w-9 p-0 transition-colors duration-200`}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">2</span>
          </div>
        </div>        <div className={`h-6 w-px ${headerColors.divider}`} />        {loading ? (
          <div className={`h-8 w-8 rounded-full animate-pulse ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg?height=32&width=32"} alt="User" />
                  <AvatarFallback>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || "User"}
                  </p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>        ) : (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => {
              const currentPath = window.location.pathname
              const redirectUrl = encodeURIComponent(currentPath === '/auth/login' ? '/dashboard' : currentPath)
              router.push(`/auth/login?redirect=${redirectUrl}`)
            }}
            disabled={loading}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Loading..." : "Sign In"}
          </Button>
        )}
      </div>
    </header>
  )
}