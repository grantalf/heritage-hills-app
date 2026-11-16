import {
  Bird,
  BookOpen,
  Building2,
  Coins,
  Droplets,
  Flower2,
  GraduationCap,
  Info,
  Landmark,
  Leaf,
  PartyPopper,
  Puzzle,
  Recycle,
  TreeDeciduous,
  Trees,
  TriangleAlert,
  Users,
  Waves,
  Wrench,
  Globe,
  type LucideIcon,
} from 'lucide-react-native';

import type { AlertKind, Capital, EcoSection, ShareCategory } from '@/lib/data/types';

export const ALERT_ICON: Record<AlertKind, LucideIcon> = { urgent: TriangleAlert, notice: Info, good: PartyPopper };

export const ECO_ICON: Record<EcoSection, LucideIcon> = {
  creek: Waves,
  plants: Flower2,
  trees: TreeDeciduous,
  wildlife: Bird,
  water: Droplets,
  soil: Recycle,
  yard: Trees,
};

export const CAPITAL_ICON: Record<Capital, LucideIcon> = {
  natural: Leaf,
  social: Users,
  human: GraduationCap,
  cultural: Globe,
  built: Building2,
  financial: Coins,
  civic: Landmark,
};

export const SHARE_ICON: Record<ShareCategory, LucideIcon> = { tool: Wrench, book: BookOpen, toy: Puzzle };
