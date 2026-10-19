import {
  Accessibility, AtSign, Award, BadgeCheck, Bike, Blocks, Book, BookOpen, Bookmark, Brain, Briefcase, Brush, Building2,
  CalendarDays, Camera, ChartNoAxesCombined, Check, CircleDot, CircleSlash, CircuitBoard, ClipboardCheck, Clock, Cloud,
  Code2, Coffee, Cog, Compass, Contact, CookingPot, Cpu, Database, Dumbbell, Ear, Eye, FileCheck, Film, Flag, FlaskConical,
  Gamepad2, GitBranch, Globe, GraduationCap, Gauge, Hammer, HandHeart, Handshake, Headphones, Heart, Home, KeyRound,
  Languages, Laptop, Layers, Leaf, Library, Lightbulb, Link, ListChecks, Mail, MapPin, Medal, Megaphone, MessageCircle,
  MessagesSquare, Microscope, Monitor, Mountain, Music, Navigation, Network, NotebookPen, Palette, Pen, PencilRuler, Phone,
  Presentation, Puzzle, Radar, Rocket, Route, Ruler, Satellite, ScanLine, School, Server, Settings, ShieldCheck, Smartphone,
  Smile, Sparkles, Speech, Sprout, Star, Target, Tent, Terminal, TrendingUp, Trophy, Truck, UserRound, Users, Volleyball,
  Wifi, Workflow, Wrench, Car, Plane, type LucideIcon,
} from 'lucide-react';
import type { CVDocument, IconName } from './model';

export const sectionIcons: Record<IconName, LucideIcon> = {
  none: CircleSlash, briefcase: Briefcase, graduation: GraduationCap, award: Award, sparkles: Sparkles,
  code: Code2, globe: Globe, heart: Heart, user: UserRound, layers: Layers, target: Target,
  mail: Mail, phone: Phone, 'map-pin': MapPin, link: Link, linkedin: Contact, github: Code2, 'at-sign': AtSign,
  contact: Contact, building: Building2, calendar: CalendarDays, clock: Clock, check: Check, 'badge-check': BadgeCheck,
  medal: Medal, trophy: Trophy, star: Star, flag: Flag, compass: Compass, rocket: Rocket, 'trending-up': TrendingUp,
  chart: ChartNoAxesCombined, presentation: Presentation, users: Users, handshake: Handshake, messages: MessagesSquare,
  message: MessageCircle, megaphone: Megaphone, lightbulb: Lightbulb, brain: Brain, puzzle: Puzzle, shield: ShieldCheck,
  settings: Settings, wrench: Wrench, hammer: Hammer, cog: Cog, gauge: Gauge, cpu: Cpu, circuit: CircuitBoard, car: Car,
  truck: Truck, navigation: Navigation, radar: Radar, satellite: Satellite, route: Route, scan: ScanLine, network: Network,
  database: Database, server: Server, terminal: Terminal, monitor: Monitor, laptop: Laptop, smartphone: Smartphone,
  cloud: Cloud, wifi: Wifi, 'git-branch': GitBranch, workflow: Workflow, blocks: Blocks, flask: FlaskConical,
  'test-tube': FlaskConical, microscope: Microscope, ruler: Ruler, 'pencil-ruler': PencilRuler, 'file-check': FileCheck,
  'clipboard-check': ClipboardCheck, 'list-check': ListChecks, book: Book, 'book-open': BookOpen, library: Library,
  school: School, languages: Languages, speech: Speech, ear: Ear, eye: Eye, accessibility: Accessibility, leaf: Leaf,
  sprout: Sprout, mountain: Mountain, bike: Bike, dumbbell: Dumbbell, volleyball: Volleyball, camera: Camera, film: Film,
  music: Music, headphones: Headphones, palette: Palette, brush: Brush, pen: Pen, notebook: NotebookPen, plane: Plane,
  tent: Tent, coffee: Coffee, cooking: CookingPot, gamepad: Gamepad2, chess: Puzzle, smile: Smile, 'hand-heart': HandHeart,
  home: Home, key: KeyRound, 'circle-dot': CircleDot, bookmark: Bookmark,
};
export const iconLabels: Record<IconName, string> = {
  none: 'Kein Symbol', briefcase: 'Beruf', graduation: 'Ausbildung', award: 'Auszeichnung', sparkles: 'Kenntnisse',
  code: 'Programmierung', globe: 'International', heart: 'Interessen', user: 'Profil', layers: 'Projekte', target: 'Ziele',
  mail: 'E-Mail', phone: 'Telefon', 'map-pin': 'Adresse', link: 'Webseite', linkedin: 'LinkedIn', github: 'GitHub',
  'at-sign': 'Kontaktadresse', contact: 'Kontakte', building: 'Unternehmen', calendar: 'Datum', clock: 'Zeit', check: 'Erledigt',
  'badge-check': 'Qualifikation', medal: 'Medaille', trophy: 'Erfolg', star: 'Favorit', flag: 'Meilenstein', compass: 'Orientierung',
  rocket: 'Innovation', 'trending-up': 'Entwicklung', chart: 'Analyse', presentation: 'Präsentation', users: 'Team',
  handshake: 'Zusammenarbeit', messages: 'Austausch', message: 'Kommunikation', megaphone: 'Moderation', lightbulb: 'Ideen',
  brain: 'Analytisches Denken', puzzle: 'Problemlösung', shield: 'Sicherheit', settings: 'Systeme', wrench: 'Werkzeuge',
  hammer: 'Handwerk', cog: 'Mechanik', gauge: 'Messtechnik', cpu: 'Elektronik', circuit: 'Schaltung', car: 'Fahrzeug',
  truck: 'Logistik', navigation: 'Navigation', radar: 'Fahrerassistenz', satellite: 'Vernetzung', route: 'Mobilität',
  scan: 'Diagnose', network: 'Netzwerke', database: 'Datenbanken', server: 'Server', terminal: 'Software', monitor: 'Computer',
  laptop: 'IT-Kenntnisse', smartphone: 'Mobile Technik', cloud: 'Cloud', wifi: 'Verbindung', 'git-branch': 'Versionsverwaltung',
  workflow: 'Prozesse', blocks: 'Architektur', flask: 'Forschung', 'test-tube': 'Tests', microscope: 'Wissenschaft',
  ruler: 'Konstruktion', 'pencil-ruler': 'Planung', 'file-check': 'Zertifikat', 'clipboard-check': 'Qualitätsmanagement',
  'list-check': 'Organisation', book: 'Wissen', 'book-open': 'Weiterbildung', library: 'Literatur', school: 'Schule',
  languages: 'Sprachen', speech: 'Sprachkenntnisse', ear: 'Zuhören', eye: 'Aufmerksamkeit', accessibility: 'Inklusion',
  leaf: 'Nachhaltigkeit', sprout: 'Wachstum', mountain: 'Wandern', bike: 'Radsport', dumbbell: 'Fitness', volleyball: 'Volleyball',
  camera: 'Fotografie', film: 'Videobearbeitung', music: 'Musik', headphones: 'Audio', palette: 'Design', brush: 'Kreativität',
  pen: 'Schreiben', notebook: 'Notizen', plane: 'Reisen', tent: 'Outdoor', coffee: 'Kultur', cooking: 'Kochen',
  gamepad: 'Gaming', chess: 'Strategie', smile: 'Empathie', 'hand-heart': 'Ehrenamt', home: 'Wohnort', key: 'Verantwortung',
  'circle-dot': 'Fokus', bookmark: 'Referenz',
};
export const iconCategories = ['Alle', 'Beruf & Persönlichkeit', 'Technik & Werkzeuge', 'Lernen & Sprache', 'Interessen', 'Kontakt'] as const;
export type IconCategory = (typeof iconCategories)[number];
const contacts = new Set<IconName>(['mail', 'phone', 'map-pin', 'link', 'linkedin', 'github', 'at-sign', 'contact', 'home']);
const learning = new Set<IconName>(['graduation', 'award', 'badge-check', 'file-check', 'book', 'book-open', 'library', 'school', 'languages', 'speech', 'globe', 'bookmark']);
const interests = new Set<IconName>(['heart', 'leaf', 'sprout', 'mountain', 'bike', 'dumbbell', 'volleyball', 'camera', 'film', 'music', 'headphones', 'palette', 'brush', 'pen', 'notebook', 'plane', 'tent', 'coffee', 'cooking', 'gamepad', 'chess', 'hand-heart']);
const technical = new Set<IconName>(['code', 'shield', 'settings', 'wrench', 'hammer', 'cog', 'gauge', 'cpu', 'circuit', 'car', 'truck', 'navigation', 'radar', 'satellite', 'route', 'scan', 'network', 'database', 'server', 'terminal', 'monitor', 'laptop', 'smartphone', 'cloud', 'wifi', 'git-branch', 'workflow', 'blocks', 'flask', 'test-tube', 'microscope', 'ruler', 'pencil-ruler', 'clipboard-check', 'list-check']);
export function iconCategory(name: IconName): IconCategory {
  return contacts.has(name) ? 'Kontakt' : learning.has(name) ? 'Lernen & Sprache' : interests.has(name) ? 'Interessen' : technical.has(name) ? 'Technik & Werkzeuge' : 'Beruf & Persönlichkeit';
}
export function matchesIcon(name: IconName, query: string) {
  const normal = (value: string) => value.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const haystack = normal(`${name} ${iconLabels[name]} ${iconCategory(name)}`);
  return normal(query).split(/\s+/).every(word => haystack.includes(word));
}
export type IconTarget = { kind: 'section'; id: string } | { kind: 'contact'; field: 'email' | 'phone' | 'address' } | { kind: 'link'; id: string };
export function defaultTargetIcon(doc: CVDocument, target: IconTarget): IconName {
  if (target.kind === 'contact') return ({ email: 'mail', phone: 'phone', address: 'map-pin' } as const)[target.field];
  if (target.kind === 'link') return 'link';
  const section = doc.sections.find(item => item.id === target.id);
  return section?.kind === 'experience' ? 'briefcase' : section?.kind === 'education' ? 'graduation' : section?.kind === 'skills' ? 'sparkles' : 'layers';
}
export function targetIcon(doc: CVDocument, target: IconTarget): IconName {
  if (target.kind === 'contact') return doc.contactIcons?.[target.field] ?? defaultTargetIcon(doc, target);
  if (target.kind === 'link') return doc.links.find(item => item.id === target.id)?.icon ?? 'link';
  return doc.sections.find(item => item.id === target.id)?.icon ?? 'layers';
}
export function withTargetIcon(doc: CVDocument, target: IconTarget, icon: IconName): CVDocument {
  if (target.kind === 'contact') return { ...doc, contactIcons: { ...doc.contactIcons, [target.field]: icon } };
  if (target.kind === 'link') return { ...doc, links: doc.links.map(item => item.id === target.id ? { ...item, icon } : item) };
  return { ...doc, sections: doc.sections.map(item => item.id === target.id ? { ...item, icon } : item) };
}
