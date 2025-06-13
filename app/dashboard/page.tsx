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
  Activity
} from "lucide-react"
import { sampleMocks } from "@/lib/mock-data"
import type { MockEndpoint } from "@/lib/types"
import { mockApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { SidebarLayout } from "@/components/layout/sidebar"
import Link from "next/link"

const methodColors = {
  GET: "bg-green-600 text-white",
  POST: "bg-blue-600 text-white",
  PUT: "bg-orange-600 text-white",
  DELETE: "bg-red-600 text-white",
  PATCH: "bg-purple-600 text-white",
}

export default function DashboardPage() {
  const [mocks, setMocks] = useState<MockEndpoint[]>(sampleMocks)
  const [selectedMocks, setSelectedMocks] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "method" | "created" | "accessed">("created")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMocks = async () => {
      try {
        const data = await mockApi.getAllMocks()
        setMocks(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch mocks",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMocks()
  }, [toast])

  const filteredMocks = mocks.filter(
    (mock) =>
      mock.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mock.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mock.method.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        variant: "success",
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
        variant: "success",
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
    <SidebarLayout>
      <div className="flex-1 bg-[#0A0A0A] text-white overflow-hidden">
        <Header />

        <main className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Enhanced Stats Cards with Animations */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {[
              {
                title: "Total Mocks",
                value: mocks.length,
                change: "+2 from last week",
                icon: Eye,
                gradient: "from-blue-500 to-purple-600"
              },
              {
                title: "Total Requests",
                value: mocks.reduce((sum, mock) => sum + mock.accessCount, 0),
                change: "+12% from last week",
                icon: TrendingUp,
                gradient: "from-green-500 to-teal-600"
              },
              {
                title: "Public Mocks",
                value: mocks.filter((mock) => mock.isPublic).length,
                change: `${Math.round((mocks.filter((mock) => mock.isPublic).length / mocks.length) * 100)}% of total`,
                icon: Globe,
                gradient: "from-orange-500 to-red-600"
              },
              {
                title: "Avg Response Time",
                value: `${Math.round(mocks.reduce((sum, mock) => sum + mock.delay, 0) / mocks.length)}ms`,
                change: "-5ms from last week",
                icon: Zap,
                gradient: "from-purple-500 to-pink-600"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group"
              >
                <Card className="relative overflow-hidden border-gray-800 bg-[#1A1A1A] hover:bg-[#1F1F1F] transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <p className="text-xs text-gray-400">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Header with Gradient */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-white">
                My Mocks
              </h1>
              <p className="text-gray-400">Manage your API mock endpoints</p>
            </div>

            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="bg-[#2D2D2D] border-gray-700 text-white hover:bg-[#3A3A3A]">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/builder">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Mock
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Search and Filters */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search mocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#2D2D2D] border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            <Button variant="outline" className="bg-[#2D2D2D] border-gray-700 text-white hover:bg-[#3A3A3A]">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </motion.div>

          {/* Bulk Actions with Animation */}
          {selectedMocks.length > 0 && (
            <motion.div 
              className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-sm font-medium text-white">{selectedMocks.length} selected</span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button variant="outline" size="sm" className="bg-[#2D2D2D] border-gray-700 text-white hover:bg-[#3A3A3A]">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            </motion.div>
          )}

          {/* Enhanced Mocks Table */}
          {isLoading ? (
            <motion.div 
              className="flex items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-2 text-white">Loading mocks...</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-gray-800 bg-[#1A1A1A]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedMocks.length === filteredMocks.length && filteredMocks.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-gray-400">Method</TableHead>
                      <TableHead className="text-gray-400">Path</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Requests</TableHead>
                      <TableHead className="text-gray-400">Last Used</TableHead>
                      <TableHead className="text-gray-400">Visibility</TableHead>
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
                        className="border-gray-800 hover:bg-[#2D2D2D] transition-colors group"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedMocks.includes(mock.id)}
                            onCheckedChange={(checked) => handleSelectMock(mock.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge className={methodColors[mock.method]}>{mock.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{mock.name || "Unnamed Mock"}</div>
                            <div className="text-sm text-gray-400 font-mono">{mock.path}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={mock.statusCode >= 400 ? "destructive" : "secondary"}>{mock.statusCode}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-white">
                            <Activity className="h-4 w-4 text-gray-400" />
                            {mock.accessCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{mock.lastAccessed.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={mock.isPublic ? "default" : "secondary"}>
                            {mock.isPublic ? "Public" : "Private"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-[#3A3A3A]">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#2D2D2D] border-gray-700">
                              <DropdownMenuItem className="text-white hover:bg-[#3A3A3A]">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-[#3A3A3A]">
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-[#3A3A3A]">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Endpoint
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive hover:bg-[#3A3A3A]" onClick={() => handleDeleteMock(mock.id)}>
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
            </motion.div>
          )}

          {filteredMocks.length === 0 && !isLoading && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-gray-400 mb-4">
                {searchQuery ? "No mocks found matching your search." : "No mocks created yet."}
              </div>
              <Link href="/builder">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Mock
                </Button>
              </Link>
            </motion.div>
          )}
        </main>
      </div>
    </SidebarLayout>
  )
}