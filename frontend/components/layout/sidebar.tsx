"use client"

import { useState, ReactNode, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useNavigation } from "@/components/ui/line-loader"
import { useTheme } from "@/components/ui/theme-provider"
import {
  Home,
  Database,
  Plus,
  FileText,
  BarChart3,
  Zap,
  Share2,
  Activity,
  Settings,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import MockBoxLogo from "@/components/ui/mockbox-logo"

interface SidebarLayoutProps {
  children: ReactNode
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    section: "Navigation"
  },
  {
    title: "My Mocks",
    href: "/mocks",
    icon: Database,
    section: "Navigation"
  },
  {
    title: "Create New",
    href: "/builder",
    icon: Plus,
    section: "Navigation"
  },
  {
    title: "Templates",
    href: "/templates",
    icon: FileText,
    section: "Navigation"
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    section: "Navigation"
  }
]

const toolsItems = [
  {
    title: "API Testing",
    href: "/testing",
    icon: Zap,
    section: "Tools"
  },
  {
    title: "Share & Export",
    href: "/share",
    icon: Share2,
    section: "Tools"
  },
  {
    title: "Monitoring",
    href: "/monitoring",
    icon: Activity,
    section: "Tools"
  }
]

const accountItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    section: "Account"
  },
  {
    title: "Account",
    href: "/account",
    icon: User,
    section: "Account"
  }
]

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { actualTheme } = useTheme()
  const { user, signOut, loading } = useAuth()
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsMobileOpen(false) // Close mobile menu on resize
      } else {
        // On desktop, maintain previous collapsed state or default to expanded
        if (!localStorage.getItem('sidebar-collapsed')) {
          setIsCollapsed(false)
        }
      }
    }

    // Load saved sidebar state on desktop
    if (typeof window !== 'undefined') {
      const savedCollapsed = localStorage.getItem('sidebar-collapsed')
      if (savedCollapsed && window.innerWidth >= 768) {
        setIsCollapsed(JSON.parse(savedCollapsed))
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }, [pathname, isMobile])

  // Theme-aware colors for sidebar
  const sidebarColors = {
    background: actualTheme === 'light' ? 'bg-white' : 'bg-[#1A1A1A]',
    border: actualTheme === 'light' ? 'border-slate-200' : 'border-gray-800',
    containerBg: actualTheme === 'light' ? 'bg-slate-50' : 'bg-[#0A0A0A]',
    itemBg: actualTheme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-[#2D2D2D]',
    activeBg: actualTheme === 'light' ? 'bg-slate-200' : 'bg-[#3A3A3A]',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-300',
    textMuted: actualTheme === 'light' ? 'text-slate-500' : 'text-gray-500',
    tooltipBg: actualTheme === 'light' ? 'bg-slate-800' : 'bg-gray-900',
    tooltipText: actualTheme === 'light' ? 'text-white' : 'text-white',
    tooltipBorder: actualTheme === 'light' ? 'border-slate-700' : 'border-gray-700'
  }

  // Header colors for mobile search and actions
  const headerColors = {
    searchBg: actualTheme === 'light' ? '#ffffff' : '#2D2D2D',
    searchBorder: actualTheme === 'light' ? 'border-slate-300 focus:border-blue-500' : 'border-gray-600 focus:border-blue-400',
    searchText: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    searchPlaceholder: actualTheme === 'light' ? 'placeholder-slate-500' : 'placeholder-gray-400',
    searchIcon: actualTheme === 'light' ? 'text-slate-500' : 'text-gray-400',
    buttonText: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-300',
    buttonHoverText: actualTheme === 'light' ? 'hover:text-slate-900' : 'hover:text-white',
    buttonHoverBg: actualTheme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-[#3A3A3A]'
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      const newCollapsed = !isCollapsed
      setIsCollapsed(newCollapsed)
      // Save state to localStorage for desktop
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed))
    }
  }
  interface SidebarItemProps {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    section: string;
  }  const SidebarItem = ({ item, isCollapsed }: { item: SidebarItemProps, isCollapsed: boolean }) => {
    const isActive = pathname === item.href
    const Icon = item.icon
    const { navigateTo } = useNavigation()

    // For mobile, never show as collapsed (always show text)
    const showText = isMobile ? true : !isCollapsed

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      navigateTo(item.href)
      // Close mobile menu after navigation
      if (isMobile) {
        setIsMobileOpen(false)
      }
    }

    return (
      <Link href={item.href} onClick={handleClick}>
        <motion.div
          className={cn(
            "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
            sidebarColors.itemBg,
            isActive
              ? `${sidebarColors.activeBg} ${sidebarColors.text}`
              : `${sidebarColors.textSecondary} hover:${sidebarColors.text}`,
            !showText && "justify-center"
          )}
          whileHover={{ x: !showText ? 0 : 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />

          <AnimatePresence>
            {showText && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.title}
              </motion.span>
            )}
          </AnimatePresence>          {/* Tooltip for collapsed state - only show on desktop when collapsed */}
          {!isMobile && !showText && (
            <div className={cn(
              "absolute left-full ml-3 px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg border",
              sidebarColors.tooltipBg.replace('bg-', 'bg-'),
              sidebarColors.tooltipText,
              sidebarColors.tooltipBorder.replace('border-', 'border-')
            )}>
              {item.title}
              {/* Arrow pointing to the sidebar */}
              <div className={cn(
                "absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent",
                sidebarColors.tooltipBg.replace('bg-', 'border-r-')
              )}></div>
            </div>
          )}

          {/* Active indicator */}
          {isActive && (
            <motion.div
              className="absolute right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
      </Link>
    )
  }
  const SectionHeader = ({ title, isCollapsed }: { title: string, isCollapsed: boolean }) => {
    // For mobile, never show as collapsed (always show text)
    const showText = isMobile ? true : !isCollapsed
    
    return (
      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
              sidebarColors.textMuted
            )}
          >
            <h3>{title}</h3>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
  return (
    <div className={cn("flex h-screen w-full", sidebarColors.containerBg, "overflow-x-hidden")}>
      {/* Professional Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (isMobileOpen ? 280 : 0) : (isCollapsed ? 70 : 250),
          x: isMobile ? (isMobileOpen ? 0 : -280) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "border-r flex flex-col relative z-50 flex-shrink-0 shadow-xl",
          isMobile ? "fixed left-0 top-0 h-full" : "relative",
          sidebarColors.background,
          sidebarColors.border,
          isCollapsed && !isMobile ? "overflow-visible" : "overflow-hidden"
        )}
      >
        {/* Logo and Toggle */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b min-h-[73px]",
          sidebarColors.border
        )}>
          <AnimatePresence>
            {((!isCollapsed && !isMobile) || (isMobile && isMobileOpen)) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <Link href="/" className="flex items-center gap-3">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 48 48"
                    fill="none"
                    className="h-8 w-8 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="m7.839 40.783 16.03-28.054L20 6 0 40.783h7.839Zm8.214 0H40L27.99 19.894l-4.02 7.032 3.976 6.914H20.02l-3.967 6.943Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="whitespace-nowrap">
                    <div className={cn("font-bold text-sm", sidebarColors.text)}>MockBox</div>
                    <div className={cn("text-xs", sidebarColors.textSecondary)}>Mock API Builder</div>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {(isCollapsed && !isMobile) && (
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              className="h-8 w-8 mx-auto"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="m7.839 40.783 16.03-28.054L20 6 0 40.783h7.839Zm8.214 0H40L27.99 19.894l-4.02 7.032 3.976 6.914H20.02l-3.967 6.943Z"
                clipRule="evenodd"
              />
            </svg>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 p-0 flex-shrink-0 transition-colors",
              sidebarColors.textSecondary,
              `hover:${sidebarColors.text.replace('text-', 'text-')}`,
              `hover:${sidebarColors.itemBg.replace('hover:', '')}`,
              !isMobile && isCollapsed && `absolute -right-3 top-4 border rounded-full shadow-lg ${sidebarColors.background} ${sidebarColors.border}`
            )}
          >
            {isMobile ? (
              <X className="h-4 w-4" />
            ) : isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation with native scrolling */}
        <div className="flex-1 py-4 space-y-1 overflow-hidden md:overflow-y-auto">
          {/* Navigation Section */}
          <div className="px-2">
            <SectionHeader title="Navigation" isCollapsed={!isMobile && isCollapsed} />
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarItem key={item.href} item={item} isCollapsed={!isMobile && isCollapsed} />
              ))}
            </div>
          </div>

          {/* Tools Section */}
          <div className="px-2 mt-6">
            <SectionHeader title="Tools" isCollapsed={!isMobile && isCollapsed} />
            <div className="space-y-1">
              {toolsItems.map((item) => (
                <SidebarItem key={item.href} item={item} isCollapsed={!isMobile && isCollapsed} />
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div className="px-2 mt-6">
            <SectionHeader title="Account" isCollapsed={!isMobile && isCollapsed} />
            <div className="space-y-1">
              {accountItems.map((item) => (
                <SidebarItem key={item.href} item={item} isCollapsed={!isMobile && isCollapsed} />
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className={cn(
          "border-t p-4 flex-shrink-0",
          sidebarColors.border
        )}>
          {user ? (
            <motion.div
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer group relative",
                sidebarColors.itemBg
              )}
              whileHover={{ x: (isMobile || !isCollapsed) ? 2 : 0 }}
              onClick={() => signOut()}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>

              <AnimatePresence>
                {(isMobile || !isCollapsed) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={cn("text-sm font-medium whitespace-nowrap", sidebarColors.text)}>
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || "User"}
                    </div>
                    <div className={cn("text-xs whitespace-nowrap", sidebarColors.textSecondary)}>
                      {user.email}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Tooltip for collapsed state */}
              {!isMobile && isCollapsed && (
                <div className={cn(
                  "absolute left-full ml-3 px-3 py-2 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg border",
                  sidebarColors.tooltipBg,
                  sidebarColors.tooltipText,
                  sidebarColors.tooltipBorder.replace('border-', 'border-')
                )}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || "User"}
                  <div className={cn(
                    "absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent",
                    sidebarColors.tooltipBg.replace('bg-', 'border-r-')
                  )}></div>
                </div>
              )}
            </motion.div>
          ) : (
            <Link href="/auth/login">
              <motion.div
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer group relative",
                  sidebarColors.itemBg
                )}
                whileHover={{ x: (isMobile || !isCollapsed) ? 2 : 0 }}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>

                <AnimatePresence>
                  {(isMobile || !isCollapsed) && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={cn("text-sm font-medium whitespace-nowrap", sidebarColors.text)}>
                        Sign In
                      </div>
                      <div className={cn("text-xs whitespace-nowrap", sidebarColors.textSecondary)}>
                        Click to login
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {!isMobile && isCollapsed && (
                  <div className={cn(
                    "absolute left-full ml-3 px-3 py-2 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg border",
                    sidebarColors.tooltipBg,
                    sidebarColors.tooltipText,
                    sidebarColors.tooltipBorder.replace('border-', 'border-')
                  )}>
                    Sign In
                    <div className={cn(
                      "absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent",
                      sidebarColors.tooltipBg.replace('bg-', 'border-r-')
                    )}></div>
                  </div>
                )}
              </motion.div>
            </Link>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:overflow-hidden min-w-0">
        {/* Enhanced Mobile Header - Menu, Logo, Search, and Actions */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-3 p-4 border-b md:hidden",
              sidebarColors.background,
              sidebarColors.border
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(true)}
              className={cn(
                "h-9 w-9 p-0 flex-shrink-0 transition-all duration-200 rounded-lg",
                sidebarColors.textSecondary,
                `hover:${sidebarColors.text.replace('text-', 'text-')}`,
                `hover:${sidebarColors.itemBg.replace('hover:', '')}`,
                "hover:scale-105 active:scale-95"
              )}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link href="/dashboard" className="flex items-center gap-2 transition-all duration-200 hover:opacity-80 flex-shrink-0">
              <svg
                width="32"
                height="32"
                viewBox="0 0 48 48"
                fill="none"
                className="h-7 w-7 flex-shrink-0"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="m7.839 40.783 16.03-28.054L20 6 0 40.783h7.839Zm8.214 0H40L27.99 19.894l-4.02 7.032 3.976 6.914H20.02l-3.967 6.943Z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex flex-col leading-tight">
                <span className={cn("font-bold text-xs", sidebarColors.text)}>
                  MockBox
                </span>
                <span className={cn("text-xs leading-none mt-1", sidebarColors.textMuted)}>
                  API Builder
                </span>
              </div>
            </Link>

            {/* Mobile Search - Full width */}
            <div className="flex-1 max-w-none">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${headerColors.searchIcon}`} />
                <Input
                  placeholder="Search mocks..."
                  className={`pl-10 pr-4 h-8 text-sm ${headerColors.searchBorder} ${headerColors.searchText} ${headerColors.searchPlaceholder} focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200`}
                  style={{ backgroundColor: headerColors.searchBg }}
                />
              </div>
            </div>
            
            {/* Mobile Actions - Minimal */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${headerColors.buttonText} ${headerColors.buttonHoverText} ${headerColors.buttonHoverBg} h-8 w-8 p-0 transition-colors duration-200`}
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">2</span>
                </div>
              </div>
              
              {/* User Profile */}
              {loading ? (
                <div className={`h-8 w-8 rounded-full animate-pulse ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg?height=32&width=32"} alt="User" />
                        <AvatarFallback>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
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
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const currentPath = window.location.pathname
                    const redirectUrl = encodeURIComponent(currentPath === '/auth/login' ? '/dashboard' : currentPath)
                    router.push(`/auth/login?redirect=${redirectUrl}`)
                  }}
                  disabled={loading}
                  className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  {loading ? "Loading..." : "Sign In"}
                </Button>
              )}
            </div>
          </motion.div>
        )}
        {children}
      </div>
    </div>
  )
}
