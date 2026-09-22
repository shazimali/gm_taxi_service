import {
  Award,
  Car,
  CheckCircle,
  Clock,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  ThumbsUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const ABOUT_ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Clock,
  Car,
  Award,
  CheckCircle,
  Heart,
  MapPin,
  Phone,
  Star,
  ThumbsUp,
  Users,
  Zap,
};

export const ABOUT_ICON_NAMES = Object.keys(ABOUT_ICON_MAP);

export function getAboutIcon(name: string | undefined | null): LucideIcon {
  return (name && ABOUT_ICON_MAP[name]) || ShieldCheck;
}
