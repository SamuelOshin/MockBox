"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigation } from "@/components/ui/line-loader"
import {
  Plus,
  Eye,
  TrendingUp,
  Zap,
  Globe,
  Activity,
  Database,
  Clock,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Calendar,
  Cpu,
  Shield,
  Rocket,
  Search,
  Filter,
  Download,
  Loader2,
  Trash2,
  Copy,
  Edit,
  ExternalLink,
  MoreHorizontal
} from "lucide-react"
import type { MockEndpoint } from "@/lib/types"
import { mockApi } from "@/lib/api"
import { toast } from "sonner"
import { SidebarLayout } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useTheme } from "@/components/ui/theme-provider"
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton"

// Method colors for badges
const methodColors = {
  GET: "bg-green-100 text-green-800 hover:bg-green-200",
  POST: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  PUT: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  DELETE: "bg-red-100 text-red-800 hover:bg-red-200",
  PATCH: "bg-purple-100 text-purple-800 hover:bg-purple-200"
}

export default function DashboardPage() {  const [mocks, setMocks] = useState<MockEndpoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMocks, setSelectedMocks] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  // use sonner's toast directly
  const { navigateTo } = useNavigation()
  const { actualTheme } = useTheme()

  // Theme-aware colors
  const themeColors = {
    background: actualTheme === 'light' ? 'bg-gradient-to-br from-slate-50 via-white to-slate-100' : 'bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#1A1A1A]',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400',
    textMuted: actualTheme === 'light' ? 'text-slate-500' : 'text-gray-500',
    cardBg: actualTheme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1A1A1A] border-gray-800',
    cardHover: actualTheme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-[#1F1F1F]',
    buttonBg: actualTheme === 'light' ? 'bg-slate-100 border-slate-300 hover:bg-slate-200' : 'bg-[#2D2D2D] border-gray-700 hover:bg-[#3A3A3A]',
    accent: actualTheme === 'light' ? 'bg-blue-50' : 'bg-blue-950/30',
    accentBorder: actualTheme === 'light' ? 'border-blue-200' : 'border-blue-800',    tableBg: actualTheme === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-gray-800 hover:bg-[#2D2D2D]',
    menuBg: actualTheme === 'light' ? 'bg-white border-slate-200' : 'bg-[#2D2D2D] border-gray-700',
    menuItemHover: actualTheme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-[#3A3A3A]'
  }
  useEffect(() => {
    const fetchMocks = async () => {
      try {
        const data = await mockApi.getAllMocks()
        setMocks(data)
      } catch (error) {
        console.error("Failed to fetch mocks:", error)
        toast.error("Failed to load mocks", {
          description: "Could not fetch mocks from the server"
        })
        setMocks([]) // Set empty array instead of sample data
      } finally {
        setIsLoading(false)
      }
    }

    fetchMocks()
  }, [])

  // Calculate dashboard metrics with safety checks
  const totalRequests = mocks.reduce((sum, mock) => {
    const count = mock.access_count || 0;
    return sum + (typeof count === 'number' ? count : 0);
  }, 0);

  const publicMocks = mocks.filter((mock) => mock.is_public === true).length;

  const recentMocks = mocks.filter((mock) => {
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const createdDate = mock.created_at ? new Date(mock.created_at) : new Date(0);
      return createdDate > weekAgo
    } catch (error) {
      return false;
    }
  }).length;

  const avgResponseTime = mocks.length > 0
    ? Math.round(mocks.reduce((sum, mock) => {
        const delay = mock.delay_ms || 0;
        return sum + (typeof delay === 'number' ? delay : 0);
      }, 0) / mocks.length)
    : 0;

  const filteredMocks = mocks.filter((mock) => {
    if (!mock || typeof mock !== 'object') return false;

    const searchLower = searchQuery.toLowerCase();
    const name = mock.name || '';
    const endpoint = mock.endpoint || '';
    const method = mock.method || '';

    return (
      name.toLowerCase().includes(searchLower) ||
      endpoint.toLowerCase().includes(searchLower) ||
      method.toLowerCase().includes(searchLower)
    );
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMocks(filteredMocks.map((mock) => mock.id))
    } else {
      setSelectedMocks([])
    }
  }

  const handleSelectMock = (mockId: string, checked: boolean) => {
    if (checked) {
      setSelectedMocks([...selectedMocks, mockId])
    } else {
      setSelectedMocks(selectedMocks.filter((id) => id !== mockId))
    }
  }

  const handleDeleteMock = async (mockId: string) => {
    try {
      await mockApi.deleteMock(mockId)
      setMocks(mocks.filter((mock) => mock.id !== mockId))
      setSelectedMocks(selectedMocks.filter((id) => id !== mockId))
      toast.success("Mock Deleted", {
        description: "Mock has been deleted successfully"
      })
    } catch (error) {
      toast.error("Delete Failed", {
        description: error instanceof Error ? error.message : "Failed to delete mock"
      })
    }
  }

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      await mockApi.deleteMocks(selectedMocks)
      setMocks(mocks.filter((mock) => !selectedMocks.includes(mock.id)))
      setSelectedMocks([])
      toast.success("Mocks Deleted", {
        description: `${selectedMocks.length} mocks have been deleted successfully`
      })
    } catch (error) {
      toast.error("Delete Failed", {
        description: error instanceof Error ? error.message : "Failed to delete mocks"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ProtectedRoute>
      <SidebarLayout>
        {isLoading ? (
          <DashboardSkeleton theme={actualTheme} />
        ) : (
          <div className={`flex-1 min-h-screen ${themeColors.background} ${themeColors.text} md:overflow-hidden transition-colors duration-200`}>
            <div className="hidden md:block">
              <Header />
            </div>

            <main className="max-w-7xl mx-auto py-4 md:py-8 px-3 sm:px-4 md:px-6 md:h-[calc(100vh-4rem)] md:overflow-y-auto overflow-x-hidden">
            {/* Welcome Section */}
            <motion.div
              className="mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className={`text-2xl md:text-4xl font-bold ${themeColors.text} mb-2`}>
                Welcome back! 👋
              </h1>
              <p className={`${themeColors.textSecondary} text-base md:text-lg mb-4 md:mb-6`}>
                Here's what's happening with your API mocks today.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigateTo("/builder")}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-9 md:h-10"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create New Mock</span>
                  <span className="sm:hidden">Create</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigateTo("/mocks")}
                  className={`${themeColors.buttonBg} gap-2 h-9 md:h-10`}
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">View All Mocks</span>
                  <span className="sm:hidden">Mocks</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigateTo("/analytics")}
                  className={`${themeColors.buttonBg} gap-2 h-9 md:h-10`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </Button>
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {[
                {
                  title: "Total Mocks",
                  value: mocks.length,
                  change: `+${recentMocks} this week`,
                  icon: Database,
                  gradient: "from-blue-500 to-purple-600",
                  color: "text-blue-500"
                },
                {
                  title: "Total Requests",
                  value: totalRequests.toLocaleString(),
                  change: "+12% from last week",
                  icon: Activity,
                  gradient: "from-green-500 to-teal-600",
                  color: "text-green-500"
                },
                {
                  title: "Public Mocks",
                  value: publicMocks,
                  change: mocks.length > 0 ? `${Math.round((publicMocks / mocks.length) * 100)}% of total` : "0% of total",
                  icon: Globe,
                  gradient: "from-orange-500 to-red-600",
                  color: "text-orange-500"
                },
                {
                  title: "Avg Response",
                  value: `${avgResponseTime}ms`,
                  change: "-5ms improvement",
                  icon: Zap,
                  gradient: "from-purple-500 to-pink-600",
                  color: "text-purple-500"
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className={`relative overflow-hidden ${themeColors.cardBg} ${themeColors.cardHover} transition-all duration-300`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${metric.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                      <CardTitle className={`text-sm font-medium ${themeColors.textSecondary}`}>
                        {metric.title}
                      </CardTitle>
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className={`text-2xl font-bold ${themeColors.text} mb-1`}>
                        {metric.value}
                      </div>
                      <p className={`text-xs ${themeColors.textMuted}`}>
                        {metric.change}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Header with Search and Actions */}
            <motion.div
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div>
                <h2 className={`text-xl md:text-2xl font-bold ${themeColors.text}`}>
                  My Mocks
                </h2>
                <p className={`${themeColors.textSecondary} text-sm md:text-base`}>Manage your API mock endpoints</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className={`${themeColors.buttonBg} ${themeColors.text} h-9 md:h-10`}>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button
                  onClick={() => navigateTo("/builder")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg h-9 md:h-10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create Mock</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeColors.textSecondary}`} />
                <Input
                  placeholder="Search mocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 h-9 md:h-10 ${actualTheme === 'light' ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500' : 'bg-[#2D2D2D] border-gray-700 text-white placeholder-gray-400'} transition-colors duration-200`}
                />
              </div>
              <Button variant="outline" className={`${themeColors.buttonBg} ${themeColors.text} h-9 md:h-10`}>
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </motion.div>

            {/* Bulk Actions */}
            {selectedMocks.length > 0 && (
              <motion.div
                className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <span className={`text-sm font-medium ${themeColors.text}`}>{selectedMocks.length} selected</span>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
                <Button variant="outline" size="sm" className={`${themeColors.buttonBg} ${themeColors.text}`}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              </motion.div>
            )}

            {/* Mocks Table - Desktop */}
            {isLoading ? (
              <DashboardSkeleton theme={actualTheme} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {/* Desktop Table View */}
                <Card className={`${themeColors.cardBg} transition-colors duration-200 hidden md:block`}>
                  <Table>
                    <TableHeader>
                      <TableRow className={`${actualTheme === 'light' ? 'border-slate-200' : 'border-gray-800'}`}>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedMocks.length === filteredMocks.length && filteredMocks.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className={themeColors.textSecondary}>Method</TableHead>
                        <TableHead className={themeColors.textSecondary}>Path</TableHead>
                        <TableHead className={themeColors.textSecondary}>Status</TableHead>
                        <TableHead className={themeColors.textSecondary}>Requests</TableHead>
                        <TableHead className={themeColors.textSecondary}>Last Used</TableHead>
                        <TableHead className={themeColors.textSecondary}>Visibility</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMocks.map((mock, index) => (
                        <motion.tr
                          key={mock.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`${actualTheme === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-gray-800 hover:bg-[#2D2D2D]'} transition-colors group`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedMocks.includes(mock.id)}
                              onCheckedChange={(checked) => handleSelectMock(mock.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge className={methodColors[mock.method as keyof typeof methodColors]}>{mock.method}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <button
                                onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                className={`font-medium ${themeColors.text} hover:text-blue-600 hover:underline transition-colors text-left`}
                              >
                                {mock.name || "Unnamed Mock"}
                              </button>
                              <div className={`text-sm ${themeColors.textSecondary} font-mono`}>{mock.endpoint}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={mock.status_code >= 400 ? "destructive" : "secondary"}>{mock.status_code}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-2 ${themeColors.text}`}>
                              <Activity className={`h-4 w-4 ${themeColors.textSecondary}`} />
                              {mock.access_count}
                            </div>
                          </TableCell>
                          <TableCell className={themeColors.text}>
                            {mock.last_accessed ? new Date(mock.last_accessed).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={mock.is_public ? "default" : "secondary"}>
                              {mock.is_public ? "Public" : "Private"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className={`opacity-0 group-hover:opacity-100 transition-opacity ${themeColors.text} ${actualTheme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-[#3A3A3A]'}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className={themeColors.menuBg}>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                  className={`${themeColors.text} ${themeColors.menuItemHover}`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/clone/${mock.id}`)}
                                  className={`${themeColors.text} ${themeColors.menuItemHover}`}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                  className={`${themeColors.text} ${themeColors.menuItemHover}`}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Endpoint
                                </DropdownMenuItem>
                                <DropdownMenuItem className={`text-destructive ${themeColors.menuItemHover}`} onClick={() => handleDeleteMock(mock.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </Card>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredMocks.map((mock, index) => (
                    <motion.div
                      key={mock.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className={`${themeColors.cardBg} ${themeColors.cardHover} transition-colors duration-200`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedMocks.includes(mock.id)}
                                onCheckedChange={(checked) => handleSelectMock(mock.id, checked as boolean)}
                              />
                              <Badge className={methodColors[mock.method as keyof typeof methodColors]}>
                                {mock.method}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className={`h-8 w-8 ${themeColors.text} ${actualTheme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-[#3A3A3A]'}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className={themeColors.menuBg}>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                  className={`${themeColors.text} ${themeColors.menuItemHover}`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/clone/${mock.id}`)}
                                  className={`${themeColors.text} ${themeColors.menuItemHover}`}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                  className={`${themeColors.text} ${themeColors.menuItemHover}`}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Endpoint
                                </DropdownMenuItem>
                                <DropdownMenuItem className={`text-destructive ${themeColors.menuItemHover}`} onClick={() => handleDeleteMock(mock.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="space-y-2">
                            <button
                              onClick={() => navigateTo(`/mocks/${mock.id}`)}
                              className={`font-medium ${themeColors.text} hover:text-blue-600 hover:underline transition-colors text-left block`}
                            >
                              {mock.name || "Unnamed Mock"}
                            </button>
                            <div className={`text-sm ${themeColors.textSecondary} font-mono break-all`}>
                              {mock.endpoint}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                              <Badge variant={mock.status_code >= 400 ? "destructive" : "secondary"}>
                                {mock.status_code}
                              </Badge>
                              <div className={`flex items-center gap-1 text-sm ${themeColors.textSecondary}`}>
                                <Activity className="h-3 w-3" />
                                {mock.access_count}
                              </div>
                            </div>
                            <Badge variant={mock.is_public ? "default" : "secondary"}>
                              {mock.is_public ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {filteredMocks.length === 0 && !isLoading && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${themeColors.textSecondary} mb-4`}>
                  {searchQuery ? "No mocks found matching your search." : "No mocks created yet."}
                </div>
                <Button
                  onClick={() => navigateTo("/builder")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Mock
                </Button>
              </motion.div>
            )}

            {/* Getting Started Section for empty dashboard */}
            {mocks.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className={`${themeColors.cardBg} text-center p-8`}>
                  <div className="mb-6">
                    <Rocket className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                    <h3 className={`text-2xl font-bold ${themeColors.text} mb-2`}>
                      Welcome to MockBox!
                    </h3>
                    <p className={`${themeColors.textSecondary} text-lg mb-6`}>
                      Get started by creating your first API mock
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => navigateTo("/builder")}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Mock
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigateTo("/templates")}
                      className={`${themeColors.buttonBg} gap-2`}
                    >
                      <Eye className="h-4 w-4" />
                      Browse Templates
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
            </main>
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  )
}
