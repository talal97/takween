"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ phone }: { phone: string }) {
  if (!phone) return null;
  const cleaned = phone.replace(/[^+\d]/g, "");
  const href = `https://wa.me/${cleaned.startsWith("+") ? cleaned.slice(1) : cleaned}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
