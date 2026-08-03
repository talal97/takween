"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Image, FileText, File, Search, Grid3X3, List } from "lucide-react";
import { deleteMediaFile } from "../actions-media";

type MediaFile = {
  name: string;
  url: string;
  size: number;
  type: "image" | "document" | "other";
  modified: string;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function TypeIcon({ type }: { type: MediaFile["type"] }) {
  if (type === "image") return <Image className="h-5 w-5 text-blue-500" />;
  if (type === "document") return <FileText className="h-5 w-5 text-orange-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "document" | "other">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const perPage = 48;
  const totalPages = Math.ceil(total / perPage);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (search) params.set("q", search);
    if (typeFilter !== "all") params.set("type", typeFilter);
    const res = await fetch(`/api/admin/media?${params}`);
    const data = await res.json();
    setFiles(data.files);
    setTotal(data.total);
    setLoading(false);
  }, [page, search, typeFilter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  async function handleDelete(name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    setDeleting(name);
    try {
      await deleteMediaFile(name);
      fetchFiles();
    } catch {
      alert("Failed to delete file.");
    }
    setDeleting(null);
  }

  return (
    <div>
      <PageHeader title="Media Library" description="Browse and manage uploaded files." />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "image", "document", "other"] as const).map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(t)}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex gap-1">
            <Button variant={view === "grid" ? "default" : "outline"} size="sm" onClick={() => setView("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {total} file{total !== 1 ? "s" : ""}
        </p>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : files.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {search ? "No files match your search." : "No files uploaded yet."}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {files.map((f) => (
              <div key={f.name} className="group relative rounded-lg border bg-white p-2 hover:shadow-md transition-shadow">
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="block">
                  {f.type === "image" ? (
                    <div className="aspect-square overflow-hidden rounded bg-muted">
                      <img
                        src={f.url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded bg-muted">
                      <TypeIcon type={f.type} />
                    </div>
                  )}
                </a>
                <div className="mt-2 space-y-1">
                  <p className="truncate text-xs font-medium" title={f.name}>
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {f.name}
                    </a>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatBytes(f.size)} &middot; {formatDate(f.modified)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(f.name)}
                  disabled={deleting === f.name}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded border bg-white px-3 py-2 hover:bg-muted/50">
                <TypeIcon type={f.type} />
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-sm font-medium hover:underline">
                  {f.name}
                </a>
                <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                <span className="text-xs text-muted-foreground">{formatDate(f.modified)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(f.name)}
                  disabled={deleting === f.name}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
