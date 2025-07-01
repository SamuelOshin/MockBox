"use client"

import { useState, ReactNode, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollbarContainer } from "@/components/ui/scrollbar-container"
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
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

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
    <div className={cn("flex h-screen", sidebarColors.containerBg)}>      {/* Professional Mobile Overlay */}
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
      </AnimatePresence>{/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? (isMobileOpen ? 280 : 0) : (isCollapsed ? 70 : 250),
          x: isMobile ? (isMobileOpen ? 0 : -280) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}        className={cn(
          "border-r flex flex-col relative z-50 flex-shrink-0 shadow-xl",
          isMobile ? "fixed left-0 top-0 h-full" : "relative",
          sidebarColors.background,
          sidebarColors.border
        )}
      >        {/* Logo and Toggle */}
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
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">MB</span>
                </div>
                <Link href="/">
                  <div className="whitespace-nowrap">
                    <div className={cn("font-bold text-sm", sidebarColors.text)}>MockBox</div>
                    <div className={cn("text-xs", sidebarColors.textSecondary)}>Mock API Builder</div>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>          {(isCollapsed && !isMobile) && (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">MB</span>
            </div>
          )}<Button
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
        </div>        {/* Navigation with ScrollbarContainer */}
        <ScrollbarContainer
          className="flex-1 py-4 space-y-1"
          theme="auto"
          scrollbarWidth="6px"
          hoverOpacity={0.8}
        >
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
        </ScrollbarContainer>        {/* User Profile */}
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
          ) : (            <Link href="/auth/login">
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
                </AnimatePresence>                {/* Tooltip for collapsed state */}
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
      </motion.aside>      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">        {/* Simple Mobile Header - Just Menu and Logo */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center justify-start p-4 border-b md:hidden",
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
            
            <Link href="/dashboard" className="flex items-center gap-3 ml-3 transition-all duration-200 hover:opacity-80">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">MB</span>
              </div>
              <div className="flex flex-col">
                <span className={cn("font-bold text-sm leading-none", sidebarColors.text)}>
                  MockBox
                </span>
                <span className={cn("text-xs leading-none mt-1", sidebarColors.textMuted)}>
                  API Builder
                </span>
              </div>
            </Link>
          </motion.div>
        )}
        {children}
      </div>
    </div>
  )
}
