"use client"

import { useState, ReactNode } from "react"
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
  const pathname = usePathname()
  const { actualTheme } = useTheme()

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
    setIsCollapsed(!isCollapsed)
  }  
  const SidebarItem = ({ item, isCollapsed }: { item: any, isCollapsed: boolean }) => {
    const isActive = pathname === item.href
    const Icon = item.icon
    const { navigateTo } = useNavigation()

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      navigateTo(item.href)
    }

    return (
      <Link href={item.href} onClick={handleClick}>
        <motion.div
          className={cn(
            "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
            sidebarColors.itemBg,
            isActive ? `${sidebarColors.activeBg} ${sidebarColors.text}` : `${sidebarColors.textSecondary} hover:${sidebarColors.text.replace('text-', 'text-')}`,
            isCollapsed && "justify-center"
          )}
          whileHover={{ x: isCollapsed ? 0 : 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          
          <AnimatePresence>
            {!isCollapsed && (
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
          </AnimatePresence>

          {/* Tooltip for collapsed state - positioned outside sidebar */}
          {isCollapsed && (
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

  const SectionHeader = ({ title, isCollapsed }: { title: string, isCollapsed: boolean }) => (
    <AnimatePresence>
      {!isCollapsed && (
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

  return (
    <div className={cn("flex h-screen", sidebarColors.containerBg)}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 70 : 250 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "border-r flex flex-col relative z-40 flex-shrink-0",
          sidebarColors.background,
          sidebarColors.border
        )}
      >
        {/* Logo and Toggle */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b min-h-[73px]",
          sidebarColors.border
        )}>
          <AnimatePresence>
            {!isCollapsed && (
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
                <div className="whitespace-nowrap">                  <div className={cn("font-bold text-sm", sidebarColors.text)}>MockBox</div>
                  <div className={cn("text-xs", sidebarColors.textSecondary)}>Mock API Builder</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">MB</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}            className={cn(
              "h-8 w-8 p-0 flex-shrink-0 transition-colors",
              sidebarColors.textSecondary,
              `hover:${sidebarColors.text.replace('text-', 'text-')}`,
              `hover:${sidebarColors.itemBg.replace('hover:', '')}`,
              isCollapsed && `absolute -right-3 top-4 border rounded-full shadow-lg ${sidebarColors.background} ${sidebarColors.border}`
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation with ScrollbarContainer */}
        <ScrollbarContainer
          className="flex-1 py-4 space-y-1"
          theme="dark"
          scrollbarWidth="6px"
          thumbColor="#4B5563"
          trackColor="#1F2937"
          hoverOpacity={0.8}
        >
          {/* Navigation Section */}
          <div className="px-2">
            <SectionHeader title="Navigation" isCollapsed={isCollapsed} />
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarItem key={item.href} item={item} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>

          {/* Tools Section */}
          <div className="px-2 mt-6">
            <SectionHeader title="Tools" isCollapsed={isCollapsed} />
            <div className="space-y-1">
              {toolsItems.map((item) => (
                <SidebarItem key={item.href} item={item} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div className="px-2 mt-6">
            <SectionHeader title="Account" isCollapsed={isCollapsed} />
            <div className="space-y-1">
              {accountItems.map((item) => (
                <SidebarItem key={item.href} item={item} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>
        </ScrollbarContainer>

        {/* User Profile */}
        <div className={cn(
          "border-t p-4 flex-shrink-0",
          sidebarColors.border
        )}>          <motion.div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer group relative",
              sidebarColors.itemBg
            )}
            whileHover={{ x: isCollapsed ? 0 : 2 }}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">JD</span>
            </div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >                  <div className={cn("text-sm font-medium whitespace-nowrap", sidebarColors.text)}>John Doe</div>
                  <div className={cn("text-xs whitespace-nowrap", sidebarColors.textSecondary)}>john@example.com</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (              <div className={cn(
                "absolute left-full ml-3 px-3 py-2 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg border",
                sidebarColors.tooltipBg,
                sidebarColors.tooltipText,
                sidebarColors.tooltipBorder.replace('border-', 'border-')
              )}>
                John Doe
                <div className={cn(
                  "absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent",
                  sidebarColors.tooltipBg.replace('bg-', 'border-r-')
                )}></div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}