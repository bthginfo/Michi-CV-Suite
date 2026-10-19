import { z } from 'zod';

export const templateIds = ['nordic', 'editorial', 'studio', 'executive', 'mono', 'haven', 'copper', 'noir', 'lumen', 'summit'] as const;
export type TemplateId = (typeof templateIds)[number];
export const iconNames = ['none', 'briefcase', 'graduation', 'award', 'sparkles', 'code', 'globe', 'heart', 'user', 'layers', 'target',
  'mail', 'phone', 'map-pin', 'link', 'linkedin', 'github', 'at-sign', 'contact', 'building', 'calendar',
  'clock', 'check', 'badge-check', 'medal', 'trophy', 'star', 'flag', 'compass', 'rocket', 'trending-up',
  'chart', 'presentation', 'users', 'handshake', 'messages', 'message', 'megaphone', 'lightbulb', 'brain', 'puzzle',
  'shield', 'settings', 'wrench', 'hammer', 'cog', 'gauge', 'cpu', 'circuit', 'car', 'truck',
  'navigation', 'radar', 'satellite', 'route', 'scan', 'network', 'database', 'server', 'terminal', 'monitor',
  'laptop', 'smartphone', 'cloud', 'wifi', 'git-branch', 'workflow', 'blocks', 'flask', 'test-tube', 'microscope',
  'ruler', 'pencil-ruler', 'file-check', 'clipboard-check', 'list-check', 'book', 'book-open', 'library', 'school', 'languages',
  'speech', 'ear', 'eye', 'accessibility', 'leaf', 'sprout', 'mountain', 'bike', 'dumbbell', 'volleyball',
  'camera', 'film', 'music', 'headphones', 'palette', 'brush', 'pen', 'notebook', 'plane', 'tent',
  'coffee', 'cooking', 'gamepad', 'chess', 'smile', 'hand-heart', 'home', 'key', 'circle-dot', 'bookmark'] as const;
export type IconName = (typeof iconNames)[number];
const text = z.string().max(16000);
const image = z.string().max(1400000).refine(v => v === '' || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v), 'Bitte ein JPG-, PNG- oder WebP-Bild verwenden.');
export const entrySchema = z.object({
  id: z.string().min(1).max(100), heading: text, subheading: text, period: text,
  body: text, image: image.default(''),
});
export const sectionSchema = z.object({
  id: z.string().min(1).max(100), title: z.string().max(200),
  kind: z.enum(['experience', 'education', 'skills', 'custom']),
  icon: z.enum(iconNames), visible: z.boolean(), entries: z.array(entrySchema).max(100),
  placement: z.enum(['auto', 'main', 'sidebar']).optional(),
});
export const documentSchema = z.object({
  version: z.literal(1), name: z.string().max(200), title: z.string().max(500),
  email: z.string().max(320), phone: z.string().max(100), address: z.string().max(500),
  summary: text, photo: image,
  contactIcons: z.object({email:z.enum(iconNames).optional(),phone:z.enum(iconNames).optional(),address:z.enum(iconNames).optional()}).optional(),
  links: z.array(z.object({id:z.string().max(100),label:z.string().max(100),url:z.string().max(2000),icon:z.enum(iconNames).optional()})).max(20),
  sections: z.array(sectionSchema).max(40),
  design: z.object({template:z.enum(templateIds),color:z.string().regex(/^#[0-9a-fA-F]{6}$/),
    font:z.enum(['sans','serif','mono']),density:z.enum(['comfortable','compact']),
    photoShape:z.enum(['rounded','circle','square']),showPhoto:z.boolean(),showFooter:z.boolean().optional(),
  }),
});
export type CVDocument = z.infer<typeof documentSchema>;
export type CVSection = z.infer<typeof sectionSchema>;
export type CVEntry = z.infer<typeof entrySchema>;
export function newId() { return crypto.randomUUID(); }
export function safeLink(value: string): string | undefined {
  try { const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); return ['http:','https:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
