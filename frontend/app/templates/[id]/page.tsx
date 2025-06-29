"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EngineSpinner } from "@/components/ui/engine-spinner";
import Link from "next/link";
import { getTemplateById } from "@/lib/api";
import type { TemplateDetail } from "@/lib/types";
import { SidebarLayout } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplate() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTemplateById(params.id);
        setTemplate(data as TemplateDetail);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchTemplate();
  }, [params.id]);

  if (loading) 
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <EngineSpinner size={48} color="#6366f1" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground justify-center">
              <span className="font-bold tracking-tight text-lg text-slate-800 dark:text-slate-100">Loading...</span>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );

  if (error) return <SidebarLayout><div className="text-red-500 p-4">{error}</div></SidebarLayout>;
  if (!template) return <SidebarLayout><div className="p-4">Template not found.</div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header />
        <main className="max-w-2xl mx-auto py-8 px-4">
          <Link href="/templates" className="text-blue-600 hover:underline text-sm mb-4 inline-block">← Back to Templates</Link>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xl">{template.name}</span>
                <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 rounded px-2 py-0.5">{template.category}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{template.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded px-2 py-0.5">{tag}</span>
                ))}
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded p-4 text-xs overflow-x-auto">
                <pre>{JSON.stringify(template.template_data, null, 2)}</pre>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <div>Created: {new Date(template.created_at).toLocaleString()}</div>
                {template.updated_at && <div>Updated: {new Date(template.updated_at).toLocaleString()}</div>}
                <div>Usage Count: {template.usage_count}</div>
                <div>Visibility: {template.is_public ? "Public" : "Private"}</div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarLayout>
  );
}
