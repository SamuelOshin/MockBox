"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollbarContainer } from "@/components/ui/scrollbar-container";
import { EngineSpinner } from "@/components/ui/engine-spinner";
import { useTheme } from "@/components/ui/theme-provider";
import { useNavigation } from "@/components/ui/line-loader";
import { getTemplateById } from "@/lib/api";
import MonacoJsonEditor from "@/components/editor/monaco-json-editor";
import type { TemplateDetail } from "@/lib/types";
import { SidebarLayout } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { 
  ArrowLeft, 
  Copy, 
  Zap, 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Tag, 
  Globe, 
  Lock, 
  AlertTriangle, 
  FileText, 
  ShoppingCart, 
  BarChart3, 
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jsonString, setJsonString] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  const router = useRouter();
  const { navigateTo } = useNavigation();
  const { actualTheme } = useTheme();
  const { toast } = useToast();

  // Theme-aware colors
  const themeColors = {
    background: actualTheme === 'light' ? 'bg-gradient-to-br from-slate-50 to-slate-100' : 'bg-gradient-to-br from-slate-900 to-slate-800',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-300',
    textMuted: actualTheme === 'light' ? 'text-slate-500' : 'text-gray-400',
    cardBg: actualTheme === 'light' ? 'bg-white' : 'bg-gray-900',
    cardBorder: actualTheme === 'light' ? 'border-slate-200' : 'border-gray-800',
    cardHover: actualTheme === 'light' ? 'hover:border-slate-300 hover:shadow-md' : 'hover:border-gray-700 hover:shadow-md',
    inputBg: actualTheme === 'light' ? 'bg-white border-slate-300' : 'bg-gray-800 border-gray-700',
    buttonBg: actualTheme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-gray-800 hover:bg-gray-700',
    tabsBg: actualTheme === 'light' ? 'bg-slate-100' : 'bg-gray-800',
    tabsActive: actualTheme === 'light' ? 'bg-white' : 'bg-gray-700',
  };

  useEffect(() => {
    async function fetchTemplate() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTemplateById(params.id);
        setTemplate(data as TemplateDetail);
        setJsonString(JSON.stringify(data.template_data, null, 2));
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchTemplate();
  }, [params.id]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Template JSON has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseTemplate = () => {
    if (template) {
      navigateTo(`/builder?templateId=${template.id}`);
    }
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
              <span className={`font-bold tracking-tight text-lg ${themeColors.text}`}>Loading template...</span>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );

  if (error) {
    return (
      <SidebarLayout>
        <div className={`flex-1 min-h-screen ${themeColors.background}`}>
          <Header />
          <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigateTo("/templates")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Button>
            </div>
            
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                  <div>
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Error Loading Template</h2>
                    <p className="text-red-600 dark:text-red-200 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarLayout>
    );
  }

  if (!template) {
    return (
      <SidebarLayout>
        <div className={`flex-1 min-h-screen ${themeColors.background}`}>
          <Header />
          <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigateTo("/templates")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <AlertTriangle className="h-12 w-12 text-amber-500" />
                  <div>
                    <h2 className="text-xl font-bold mb-2">Template Not Found</h2>
                    <p className="text-muted-foreground mb-4">The template you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => navigateTo("/templates")}>Browse Templates</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarLayout>
    );
  }

  // Template exists, render the detail view
  const CategoryIcon = categoryIcons[template.category] || categoryIcons.default;
  const categoryColor = categoryColors[template.category] || categoryColors.default;

  return (
    <SidebarLayout>
      <div className={`flex-1 min-h-screen ${themeColors.background} transition-colors duration-200`}>
        <Header />
        <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
          {/* Back Button and Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateTo("/templates")}
                  className="h-9 w-9 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className={`text-2xl font-bold ${themeColors.text}`}>{template.name}</h1>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge className={categoryColor}>
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {template.category}
                    </Badge>
                    {template.is_public ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCopyJson}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleUseTemplate}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="h-4 w-4" />
                  Use Template
                </Button>
              </div>
            </div>
            
            {/* Description */}
            {template.description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <p className={`${themeColors.textSecondary} text-lg mb-4 max-w-3xl`}>
                  {template.description}
                </p>
              </motion.div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Template Metadata */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Template Info Card */}
              <Card className={`${themeColors.cardBg} ${themeColors.cardBorder}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Template Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className={`text-sm font-medium ${themeColors.textMuted} mb-1`}>Usage Count</h3>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className={`text-lg font-semibold ${themeColors.text}`}>{template.usage_count}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-sm font-medium ${themeColors.textMuted} mb-1`}>Visibility</h3>
                      <div className="flex items-center gap-2">
                        {template.is_public ? (
                          <>
                            <Globe className="h-4 w-4 text-green-500" />
                            <span className={`${themeColors.text}`}>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 text-amber-500" />
                            <span className={`${themeColors.text}`}>Private</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className={`text-sm font-medium ${themeColors.textMuted} mb-1`}>Created</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span className={`${themeColors.text}`}>
                        {new Date(template.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {template.updated_at && (
                    <div>
                      <h3 className={`text-sm font-medium ${themeColors.textMuted} mb-1`}>Last Updated</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className={`${themeColors.text}`}>
                          {new Date(template.updated_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {template.created_by && (
                    <div>
                      <h3 className={`text-sm font-medium ${themeColors.textMuted} mb-1`}>Created By</h3>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-500" />
                        <span className={`${themeColors.text}`}>User ID: {template.created_by}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Tags Card */}
              <Card className={`${themeColors.cardBg} ${themeColors.cardBorder}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-500" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.length > 0 ? (
                      template.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="text-xs py-1"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className={`text-sm ${themeColors.textMuted}`}>No tags available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card className={`${themeColors.cardBg} ${themeColors.cardBorder}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={handleUseTemplate}
                  >
                    <Zap className="h-4 w-4" />
                    Use in Builder
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleCopyJson}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy JSON
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => navigateTo(`/templates`)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Templates
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Right Column - Template Data Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className={`${themeColors.cardBg} ${themeColors.cardBorder}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Template Data
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopyJson}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    Preview the template data structure that will be used to create your mock API.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <MonacoJsonEditor
                      value={jsonString}
                      onChange={setJsonString}
                      height="500px"
                      readOnly={true}
                      showToolbar={true}
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    onClick={handleUseTemplate}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Zap className="h-4 w-4" />
                    Use This Template
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarLayout>
  );
}