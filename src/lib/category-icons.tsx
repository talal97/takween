import {
  Compass,
  Cpu,
  Landmark,
  FileSignature,
  UserCog,
  Settings2,
  Megaphone,
  HardHat,
  ShieldAlert,
  Factory,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

// Fallback icon shown for a super-category when no custom icon/image has been uploaded for it.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "leadership-strategy-governance": Compass,
  "emerging-technology-courses": Cpu,
  "finance-investment-training-courses": Landmark,
  "project-contract-management": FileSignature,
  "people-hr-talent-management-training-subjects": UserCog,
  "operations-quality-business-excellence": Settings2,
  "pr-sales-customer-service": Megaphone,
  "technical-training-courses": HardHat,
  "hse-security-courses": ShieldAlert,
  "sector-specific-training-courses": Factory,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? LayoutGrid;
}
