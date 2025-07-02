"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollbarContainer } from "@/components/ui/scrollbar-container";
import { EngineSpinner } from "@/components/ui/engine-spinner";
import { useTheme } from "@/components/ui/theme-provider";
import { useNavigation } from "@/components/ui/line-loader";
import { getAllTemplates } from "@/lib/api";
import type { Template } from "@/lib/types";
import { SidebarLayout } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  User, 
  ShoppingCart, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  ChevronDown, 
  Plus, 
  Copy, 
  Zap, 
  Clock, 
  Tag, 
  SlidersHorizontal, 
  RefreshCw,
  Eye
} from "lucide-react";

// Category icons mapping
const categoryIcons: Record<string, any> = {
  "REST API": FileText,
  "E-commerce": ShoppingCart,
  "User Data": User,
  "Error Handling": AlertTriangle,
  "Analytics": BarChart3,
  "Social Media": MessageSquare,
  // Fallback for unknown categories
  "default": FileText
};

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
  "REST API": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "E-commerce": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "User Data": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Error Handling": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "Analytics": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Social Media": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  // Fallback for unknown categories
  "default": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const router = useRouter();
  const { navigateTo } = useNavigation();
  const { actualTheme } = useTheme();

  // Theme-aware colors
  const themeColors = {
    background: actualTheme === 'light' ? 'bg-gradient-to-br from-slate-50 to-slate-100' : 'bg-[#0A0A0A]',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-300',
    textMuted: actualTheme === 'light' ? 'text-slate-500' : 'text-gray-400',
    cardBg: actualTheme === 'light' ? 'bg-white' : 'bg-[#1A1A1A]',
    cardBorder: actualTheme === 'light' ? 'border-slate-200' : 'border-gray-800',
    cardHover: actualTheme === 'light' ? 'hover:border-slate-300 hover:shadow-md' : 'hover:border-gray-700 hover:shadow-md',
    inputBg: actualTheme === 'light' ? 'bg-white border-slate-300' : 'bg-[#2D2D2D] border-gray-700',
    buttonBg: actualTheme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-[#2D2D2D] hover:bg-[#3A3A3A]',
    tabsBg: actualTheme === 'light' ? 'bg-slate-100' : 'bg-[#2D2D2D]',
    tabsActive: actualTheme === 'light' ? 'bg-white' : 'bg-[#3A3A3A]',
  };

  // Extract unique categories from templates
  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))];

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      setError(null);
      try {
        const templates = await getAllTemplates({ page: 1, limit: 50 });
        setTemplates(templates);
        setFilteredTemplates(templates);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  // Filter and sort templates when search, category, or sort criteria change
  useEffect(() => {
    let result = [...templates];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(template => 
        template.name.toLowerCase().includes(query) || 
        (template.description && template.description.toLowerCase().includes(query)) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(template => template.category === selectedCategory);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "popular":
        // Assuming templates have a usage_count property
        result.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
        break;
    }
    
    setFilteredTemplates(result);
  }, [searchQuery, selectedCategory, sortBy, templates]);

  const refreshTemplates = async () => {
    setIsRefreshing(true);
    try {
      const templates = await getAllTemplates({ page: 1, limit: 50 });
      setTemplates(templates);
      setFilteredTemplates(templates);
    } catch (err: any) {
      setError(err.message || "Failed to refresh templates");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    // Store the template ID in localStorage as a fallback for auth redirects
    localStorage.setItem('pendingTemplateId', templateId);
    navigateTo(`/builder?templateId=${templateId}`);
  };

  if (loading) 
    return (
      <SidebarLayout>
        <div className={`min-h-screen flex items-center justify-center ${themeColors.background}`}>
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <EngineSpinner size={48} color="#6366f1" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground justify-center">
              <span className={`font-bold tracking-tight text-lg ${themeColors.text}`}>
                Loading templates...
              </span>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );

  return (
    <SidebarLayout>
      <div className={`flex-1 min-h-screen ${themeColors.background} transition-colors duration-200`}>
        <Header />
        <main className="max-w-7xl mx-auto py-4 md:py-8 px-3 sm:px-4 md:px-6 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
          {/* Hero Section */}
          <motion.div 
            className="mb-6 md:mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`text-2xl md:text-3xl font-bold ${themeColors.text} mb-2`}>API Mock Templates</h1>
            <p className={`text-sm md:text-base ${themeColors.textSecondary} max-w-2xl mx-auto px-2`}>
              Jumpstart your API development with our curated collection of mock templates.
              Choose a template to quickly create realistic API endpoints.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeColors.textMuted}`} />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 h-9 md:h-10 text-sm ${themeColors.inputBg}`}
                />
              </div>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className={`w-full md:w-[180px] h-9 md:h-10 ${themeColors.inputBg}`}>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className={`w-full md:w-[180px] h-9 md:h-10 ${themeColors.inputBg}`}>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh Button */}
              <Button 
                variant="outline" 
                size="icon" 
                onClick={refreshTemplates} 
                disabled={isRefreshing}
                className={`${themeColors.buttonBg} h-9 md:h-10 w-9 md:w-10`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Category Tabs - Alternative to dropdown for larger screens */}
            <div className="hidden md:block">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className={`${themeColors.tabsBg} min-w-max`}>
                {categories.map((category) => (
                  <TabsTrigger 
                  key={category} 
                  value={category}
                  className={`${selectedCategory === category ? themeColors.tabsActive : ''}`}
                  >
                  {category === "all" ? "All Categories" : category}
                  </TabsTrigger>
                ))}
                </TabsList>
              </Tabs>
              </div>
            </div>
          </motion.div>

          {/* Results Count and Create Template Button */}
          <motion.div 
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className={`${themeColors.textSecondary} text-sm md:text-base`}>
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
            </p>
            <Button className="gap-2 h-9 md:h-10 text-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Template</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshTemplates} 
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredTemplates.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className={`${themeColors.textSecondary} mb-4`}>
                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className={`text-xl font-semibold ${themeColors.text} mb-2`}>No templates found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSortBy("newest");
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredTemplates.map((template, index) => {
              const CategoryIcon = categoryIcons[template.category] || categoryIcons.default;
              const categoryColor = categoryColors[template.category] || categoryColors.default;
              
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className={`h-full ${themeColors.cardBg} ${themeColors.cardBorder} ${themeColors.cardHover} transition-all duration-200 overflow-hidden`}>
                    <CardHeader className="pb-2 px-4 pt-4 md:px-6 md:pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                          <div className={`p-1.5 md:p-2 rounded-lg ${categoryColor} flex-shrink-0`}>
                            <CategoryIcon className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className={`text-base md:text-lg ${themeColors.text} truncate`}>{template.name}</CardTitle>
                            <CardDescription className="text-xs md:text-sm truncate">
                              {template.category}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6">
                      <p className={`text-xs md:text-sm ${themeColors.textSecondary} mb-3 md:mb-4 line-clamp-2 h-8 md:h-10 leading-tight`}>
                        {template.description || "No description provided."}
                      </p>
                      <div className="flex flex-wrap gap-1 md:gap-1.5 mb-3 md:mb-4">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs px-2 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            +{template.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 px-4 md:px-6 pb-4 md:pb-6 flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="hidden sm:inline">{new Date(template.created_at).toLocaleDateString()}</span>
                        <span className="sm:hidden">{new Date(template.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex gap-1.5 md:gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 h-7 md:h-8 px-2 md:px-3"
                          onClick={() => navigateTo(`/templates/${template.id}`)}
                        >
                          <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          <span className="hidden md:inline">Details</span>
                        </Button>
                        <Button 
                          size="sm" 
                          className="gap-1 h-7 md:h-8 px-2 md:px-3"
                          onClick={() => handleUseTemplate(template.id)}
                        >
                          <Zap className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          <span className="hidden md:inline">Use</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </SidebarLayout>
  );
}