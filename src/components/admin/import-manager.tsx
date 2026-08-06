"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchLiveContent, importAll } from "@/app/admin/(protected)/actions-import";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, CheckCircle2, XCircle, SkipForward, Loader2, Globe } from "lucide-react";

type ImportResult = {
  type: string;
  slug: string;
  status: "imported" | "skipped" | "error";
  message?: string;
};

type ContentCounts = {
  courses: number;
  categories: number;
  superCategories: number;
  certificates: number;
  articles: number;
};

export function ImportManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [counts, setCounts] = useState<ContentCounts | null>(null);
  const [results, setResults] = useState<ImportResult[] | null>(null);

  async function handleFetch() {
    setFetching(true);
    try {
      const c = await fetchLiveContent();
      setCounts(c);
    } catch (e) {
      console.error(e);
    }
    setFetching(false);
  }

  async function handleImport() {
    setLoading(true);
    setResults(null);
    try {
      const res = await importAll();
      const all = [...res.courses, ...res.categories, ...res.superCategories, ...res.certificates, ...res.articles];
      setResults(all);
      router.refresh();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const imported = results?.filter((r) => r.status === "imported").length || 0;
  const skipped = results?.filter((r) => r.status === "skipped").length || 0;
  const errors = results?.filter((r) => r.status === "error").length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand" />
            Import from Live Site
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fetch content from the live website (wazzankw.com) and import it into your local database.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleFetch} disabled={fetching || loading}>
              {fetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {fetching ? "Fetching..." : "Fetch Live Content"}
            </Button>
            <Button onClick={handleImport} disabled={loading || fetching}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {loading ? "Importing..." : "Import All Content"}
            </Button>
          </div>

          {counts && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { label: "Courses", value: counts.courses },
                { label: "Categories", value: counts.categories },
                { label: "Super Categories", value: counts.superCategories },
                { label: "Certificates", value: counts.certificates },
                { label: "Articles", value: counts.articles },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold text-navy">{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
              ))}
            </div>
          )}

          {results && (
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle2 className="mr-1 h-3 w-3" /> {imported} imported
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700">
                <SkipForward className="mr-1 h-3 w-3" /> {skipped} skipped
              </Badge>
              {errors > 0 && (
                <Badge className="bg-red-100 text-red-700">
                  <XCircle className="mr-1 h-3 w-3" /> {errors} errors
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
