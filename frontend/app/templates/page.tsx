"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EngineSpinner } from "@/components/ui/engine-spinner";
import { getAllTemplates } from "@/lib/api";
import type { Template } from "@/lib/types";
import { SidebarLayout } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      setError(null);
      try {
        const templates = await getAllTemplates({ page: 1, limit: 50 });
        setTemplates(templates);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <EngineSpinner size={48} color="#6366f1" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground justify-center">
            <span className="font-bold tracking-tight text-lg text-slate-800 dark:text-slate-100">
              Loading...
            </span>
          </div>
        </div>
      </div>
    );
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <SidebarLayout>
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header />
        <main className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Mock Templates</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => (
              <Link key={tpl.id} href={`/templates/${tpl.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{tpl.name}</span>
                      <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 rounded px-2 py-0.5">
                        {tpl.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {tpl.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tpl.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </SidebarLayout>
  );
}
