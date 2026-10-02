import {
  Award,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Landmark,
  ScrollText,
  Shield,
  ShieldCheck,
  Star,
  Swords,
  Target,
  Trees,
  Users,
  type LucideIcon,
} from "lucide-react";

/** lucide icon name → component (data files store the string name). */
const PREP_ICONS: Record<string, LucideIcon> = {
  Award,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Landmark,
  ScrollText,
  Shield,
  ShieldCheck,
  Star,
  Swords,
  Target,
  Trees,
  Users,
};

export function getPrepIcon(name?: string): LucideIcon {
  return (name && PREP_ICONS[name]) || BookOpen;
}
