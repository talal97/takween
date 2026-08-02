"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UploadInput({
  value,
  onChange,
  kind = "file",
  label = "Upload file",
}: {
  value: string;
  onChange: (url: string) => void;
  kind?: "file" | "image";
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const url = data.urls?.[0]?.url;
      if (url) onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isImage = kind === "image" || /\.(jpe?g|png|webp|gif)$/i.test(value || "");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {isImage && value && (
          <img src={value} alt="" className="h-12 w-20 rounded border object-contain bg-muted" />
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          {busy ? "Uploading…" : label}
        </Button>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              onChange("");
            }}
          >
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.xlsx,.xls,.csv,.doc,.docx,.ppt,.pptx"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {value && !isImage && (
        <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand underline">
          {value.split("/").pop()}
        </a>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}