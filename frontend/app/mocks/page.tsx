"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNavigation } from "@/components/ui/line-loader"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Download,
  Eye,
  TrendingUp,
  Loader2,
  Zap,
  Globe,
  Activity,
  Database,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import type { MockEndpoint } from "@/lib/types"
import { mockApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { SidebarLayout } from "@/components/layout/sidebar"
import { useTheme } from "@/components/ui/theme-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MocksPageSkeleton } from "@/components/ui/mocks-skeleton"
import Link from "next/link"

const methodColors = {
  GET: "bg-green-600 text-white",
  POST: "bg-blue-600 text-white",
  PUT: "bg-orange-600 text-white",
  DELETE: "bg-red-600 text-white",
  PATCH: "bg-purple-600 text-white",
  HEAD: "bg-gray-600 text-white",
  OPTIONS: "bg-indigo-600 text-white",
}

export default function MocksPage() {
  const [mocks, setMocks] = useState<MockEndpoint[]>([])
  const [selectedMocks, setSelectedMocks] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "method" | "created" | "accessed">("created")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const { navigateTo } = useNavigation()
  const { actualTheme } = useTheme()

  // Theme-aware colors
  const themeColors = {
    background: actualTheme === 'light' ? 'bg-slate-50' : 'bg-[#0A0A0A]',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400',
    cardBg: actualTheme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1A1A1A] border-gray-800',
    cardBorder: actualTheme === 'light' ? 'border-slate-200' : 'border-gray-800',
    cardHover: actualTheme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-[#1F1F1F]',
    buttonBg: actualTheme === 'light' ? 'bg-slate-100 border-slate-300 hover:bg-slate-200' : 'bg-[#2D2D2D] border-gray-700 hover:bg-[#3A3A3A]',
    tableBg: actualTheme === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-gray-800 hover:bg-[#2D2D2D]',
    menuBg: actualTheme === 'light' ? 'bg-white border-slate-200' : 'bg-[#2D2D2D] border-gray-700',
    menuItemHover: actualTheme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-[#3A3A3A]'
  }
  useEffect(() => {
    const fetchMocks = async () => {
      try {
        const data = await mockApi.getAllMocks()

        if (Array.isArray(data)) {
          setMocks(data)
        } else {
          throw new Error('Invalid data format returned from API');
        }      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch mocks from server",
          variant: "destructive",
        })
        setMocks([]) // Set empty array instead of sample data
      } finally {
        setIsLoading(false)
      }
    }

    fetchMocks()  }, [toast])


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
      toast({
        title: "Mock Deleted",
        description: "Mock has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete mock",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      await mockApi.deleteMocks(selectedMocks)
      setMocks(mocks.filter((mock) => !selectedMocks.includes(mock.id)))
      setSelectedMocks([])
      toast({
        title: "Mocks Deleted",
        description: `${selectedMocks.length} mocks have been deleted successfully`,
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete mocks",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }
  return (
    <ProtectedRoute>
      <SidebarLayout>
        {isLoading ? (
          <MocksPageSkeleton theme={actualTheme} />
        ) : (
          <div className={`flex-1 min-h-screen ${themeColors.background} ${themeColors.text} md:overflow-hidden transition-colors duration-200`}>
            <div className="hidden md:block">
              <Header />
            </div>

            <main className="max-w-7xl mx-auto py-4 md:py-8 px-3 sm:px-4 md:px-6 md:h-[calc(100vh-4rem)] md:overflow-y-auto overflow-x-hidden">
            {/* Header Section */}
            <motion.div
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${themeColors.text} mb-2`}>My Mocks</h1>
                <p className={`${themeColors.textSecondary} text-base sm:text-lg`}>
                  Manage and organize your API mocks
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => navigateTo("/builder")}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden xs:inline">Create New Mock</span>
                  <span className="xs:hidden">Create</span>
                </Button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >              {[
                {
                  title: "Total Mocks",
                  value: mocks.length,
                  icon: Database,
                  color: "text-blue-500"
                },                {
                  title: "Active Mocks",
                  value: mocks.filter((mock) => mock && mock.is_public === true).length,
                  icon: CheckCircle,
                  color: "text-green-500"
                },
                {
                  title: "Private Mocks",
                  value: mocks.filter((mock) => mock && mock.is_public === false).length,
                  icon: AlertCircle,
                  color: "text-orange-500"
                },
                {
                  title: "Total Requests",
                  value: mocks.reduce((sum, mock) => {
                    const count = mock && typeof mock.access_count === 'number' ? mock.access_count : 0;
                    return sum + count;
                  }, 0),
                  icon: Activity,
                  color: "text-purple-500"
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className={`relative overflow-hidden ${themeColors.cardBg} ${themeColors.cardHover} transition-all duration-300`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 px-4 sm:px-6">
                      <CardTitle className={`text-sm font-medium ${themeColors.textSecondary}`}>
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                    </CardHeader>
                    <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className={`text-xl sm:text-2xl font-bold ${themeColors.text}`}>
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative flex-1 max-w-full sm:max-w-sm">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeColors.textSecondary}`} />
                <Input
                  placeholder="Search mocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 h-9 sm:h-10 ${actualTheme === 'light' ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500' : 'bg-[#2D2D2D] border-gray-700 text-white placeholder-gray-400'} transition-colors duration-200`}
                />
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={`gap-2 ${themeColors.buttonBg} flex-1 sm:flex-none`}>
                      <Filter className="h-4 w-4" />
                      <span className="hidden xs:inline">Sort by: {sortBy}</span>
                      <span className="xs:hidden">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className={themeColors.menuBg}>
                    <DropdownMenuItem onClick={() => setSortBy("name")} className={themeColors.menuItemHover}>
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("method")} className={themeColors.menuItemHover}>
                      Method
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("created")} className={themeColors.menuItemHover}>
                      Created Date
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("accessed")} className={themeColors.menuItemHover}>
                      Last Accessed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>

            {/* Bulk Actions */}
            {selectedMocks.length > 0 && (
              <motion.div
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 ${themeColors.cardBg} rounded-lg border mb-4 sm:mb-6`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span className={`${themeColors.textSecondary} text-sm sm:text-base`}>
                  {selectedMocks.length} selected
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="hidden xs:inline">Delete Selected</span>
                    <span className="xs:hidden">Delete</span>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Mocks Table/Cards */}
            <motion.div
                className={`${themeColors.cardBg} rounded-lg border overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {/* Mobile Card View */}
                <div className="block lg:hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Checkbox
                        checked={selectedMocks.length === filteredMocks.length && filteredMocks.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className={`text-sm ${themeColors.textSecondary}`}>
                        Select All
                      </span>
                    </div>
                    <div className="space-y-3">
                      {filteredMocks.map((mock) => (
                        <div
                          key={mock.id}
                          className={`p-4 rounded-lg border ${themeColors.cardBg} ${themeColors.cardBorder}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                checked={selectedMocks.includes(mock.id)}
                                onCheckedChange={(checked) => handleSelectMock(mock.id, !!checked)}
                              />
                              <div className="flex-1 min-w-0">
                                <button
                                  onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                  className={`font-medium ${themeColors.text} hover:text-blue-600 hover:underline transition-colors text-left truncate block`}
                                >
                                  {mock.name}
                                </button>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={methodColors[mock.method]} variant="secondary">
                                    {mock.method}
                                  </Badge>
                                  {mock.is_public ? (
                                    <Globe className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-orange-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className={themeColors.menuBg}>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                  className={themeColors.menuItemHover}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/clone/${mock.id}`)}
                                  className={themeColors.menuItemHover}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                  className={themeColors.menuItemHover}
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem className={themeColors.menuItemHover}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteMock(mock.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className={`text-xs sm:text-sm ${themeColors.textSecondary} font-mono mb-2 truncate`}>
                            {mock.endpoint}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={mock.status_code === 200 ? "default" : "destructive"}>
                                {mock.status_code}
                              </Badge>
                              <span className={`text-xs ${themeColors.textSecondary}`}>
                                {mock.access_count} requests
                              </span>
                            </div>
                            <span className={`text-xs ${themeColors.textSecondary}`}>
                              {mock.last_accessed ? new Date(mock.last_accessed).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow className={themeColors.tableBg}>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedMocks.length === filteredMocks.length && filteredMocks.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className={themeColors.text}>Name</TableHead>
                        <TableHead className={themeColors.text}>Method</TableHead>
                        <TableHead className={themeColors.text}>Path</TableHead>
                        <TableHead className={themeColors.text}>Status</TableHead>
                        <TableHead className={themeColors.text}>Requests</TableHead>
                        <TableHead className={themeColors.text}>Last Accessed</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMocks.map((mock) => (
                        <TableRow key={mock.id} className={themeColors.tableBg}>
                          <TableCell>
                            <Checkbox
                              checked={selectedMocks.includes(mock.id)}
                              onCheckedChange={(checked) => handleSelectMock(mock.id, !!checked)}
                            />
                          </TableCell>                          <TableCell className={`font-medium ${themeColors.text}`}>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                className="hover:text-blue-600 hover:underline transition-colors text-left"
                              >
                                {mock.name}
                              </button>                              {mock.is_public ? (
                                <Globe className="h-3 w-3 text-green-500" />
                              ) : (
                                <Clock className="h-3 w-3 text-orange-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={methodColors[mock.method]} variant="secondary">
                              {mock.method}
                            </Badge>
                          </TableCell>                          <TableCell className={`font-mono text-sm ${themeColors.textSecondary}`}>
                            {mock.endpoint}
                          </TableCell>
                          <TableCell>
                            <Badge variant={mock.status_code === 200 ? "default" : "destructive"}>
                              {mock.status_code}
                            </Badge>
                          </TableCell>
                          <TableCell className={themeColors.textSecondary}>
                            {mock.access_count}
                          </TableCell>
                          <TableCell className={`text-sm ${themeColors.textSecondary}`}>
                            {mock.last_accessed ? new Date(mock.last_accessed).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>                              <DropdownMenuContent align="end" className={themeColors.menuBg}>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                  className={themeColors.menuItemHover}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/clone/${mock.id}`)}
                                  className={themeColors.menuItemHover}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigateTo(`/mocks/${mock.id}`)}
                                  className={themeColors.menuItemHover}
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem className={themeColors.menuItemHover}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteMock(mock.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>                  
                    </Table>
                </div>
              </motion.div>

            {filteredMocks.length === 0 && (
              <motion.div
                className={`${themeColors.cardBg} rounded-lg border p-6 sm:p-8 lg:p-12 text-center`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Database className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-400" />
                <h3 className={`text-lg font-semibold ${themeColors.text} mb-2`}>No mocks found</h3>
                <p className={`${themeColors.textSecondary} mb-4 sm:mb-6 text-sm sm:text-base`}>
                  {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first mock"}
                </p>
                <Button onClick={() => navigateTo("/builder")} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Create New Mock
                </Button>
              </motion.div>
            )}

            </main>
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  )
}
