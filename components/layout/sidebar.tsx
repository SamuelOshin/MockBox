"use client"

import { useState, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollbarContainer } from "@/components/ui/scrollbar-container"
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
    href: "/dashboard",
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const SidebarItem = ({ item, isCollapsed }: { item: any, isCollapsed: boolean }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <Link href={item.href}>
        <motion.div
          className={cn(
            "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
            "hover:bg-[#2D2D2D]",
            isActive ? "bg-[#3A3A3A] text-white" : "text-gray-300 hover:text-white",
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
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg border border-gray-700">
              {item.title}
              {/* Arrow pointing to the sidebar */}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
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
          className="px-3 py-2"
        >
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 70 : 250 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#1A1A1A] border-r border-gray-800 flex flex-col relative z-40 flex-shrink-0"
      >
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 min-h-[73px]">
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
                <div className="whitespace-nowrap">
                  <div className="text-white font-bold text-sm">MockBox</div>
                  <div className="text-gray-400 text-xs">Mock API Builder</div>
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
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#2D2D2D] flex-shrink-0",
              isCollapsed && "absolute -right-3 top-4 bg-[#1A1A1A] border border-gray-800 rounded-full shadow-lg"
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
        <div className="border-t border-gray-800 p-4 flex-shrink-0">
          <motion.div
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2D2D2D] transition-colors cursor-pointer group relative"
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
                >
                  <div className="text-white text-sm font-medium whitespace-nowrap">John Doe</div>
                  <div className="text-gray-400 text-xs whitespace-nowrap">john@example.com</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg border border-gray-700">
                John Doe
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
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