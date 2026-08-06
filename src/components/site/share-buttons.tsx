"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Share2, Link2, Mail } from "lucide-react";
import { siteUrl } from "@/lib/seo";

export function ShareButtons({
  title,
  description,
  path,
}: {
  title: string;
  description?: string;
  path: string;
}) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const url = siteUrl(path);
  const text = description ? `${title} - ${description}` : title;

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canShare && (
        <button
          onClick={nativeShare}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
          data-track="share-native"
        >
          <Share2 className="h-3.5 w-3.5" />
          {t("share")}
        </button>
      )}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#1877F2] hover:text-[#1877F2]"
        data-track="share-facebook"
      >
        Facebook
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#0A66C2] hover:text-[#0A66C2]"
        data-track="share-linkedin"
      >
        LinkedIn
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#25D366] hover:text-[#25D366]"
        data-track="share-whatsapp"
      >
        WhatsApp
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-navy hover:text-navy"
        data-track="share-email"
      >
        <Mail className="h-3.5 w-3.5" />
        {t("emailCourse")}
      </a>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
        data-track="share-copy"
      >
        <Link2 className="h-3.5 w-3.5" />
        {copied ? t("copied") : t("copyLink")}
      </button>
    </div>
  );
}
