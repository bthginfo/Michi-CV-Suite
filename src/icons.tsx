import { Award, Briefcase, Code2, Globe, GraduationCap, Heart, Layers, Sparkles, Target, UserRound, type LucideIcon } from 'lucide-react';
import type { IconName } from './model';

export const sectionIcons: Record<IconName, LucideIcon> = {
  briefcase: Briefcase, graduation: GraduationCap, award: Award, sparkles: Sparkles,
  code: Code2, globe: Globe, heart: Heart, user: UserRound, layers: Layers, target: Target,
};
export const iconLabels: Record<IconName, string> = {
  briefcase: 'Beruf', graduation: 'Ausbildung', award: 'Auszeichnung', sparkles: 'Kenntnisse',
  code: 'Technik', globe: 'Sprachen', heart: 'Interessen', user: 'Profil', layers: 'Projekte', target: 'Ziele',
};
