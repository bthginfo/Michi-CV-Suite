import type { CVDocument, CVEntry, CVSection, TemplateId } from './model';
import { textLinks } from './textLinks';

export type EntryField = 'heading' | 'subheading' | 'period' | 'body';
export type Unit = {
  key: string; type: 'summary' | 'section' | 'entry' | 'field' | 'body' | 'image' | 'empty';
  section?: CVSection; entry?: CVEntry; value?: string; field?: EntryField;
  start?: number; end?: number; line?: number; continued?: boolean; keep?: boolean;
};
export type Phase = 'career' | 'qualifications';
export type FrameKind = 'first' | 'career' | 'qualifications' | 'qualifications-continued';
export const portfolioSlots = {
  'portfolio-feature': ['feature-context', 'feature-main', 'feature-support'],
  'portfolio-credentials': ['credential-context', 'credential-main', 'credential-support'],
} as const;
export type PortfolioLayout = keyof typeof portfolioSlots;
export type Slot = 'full' | 'left' | 'right' | 'primary' | 'secondary' | (typeof portfolioSlots)[PortfolioLayout][number];
export type Fragment = { key: string; sourceKey?: string; units: Unit[]; section?: CVSection; role: 'primary' | 'secondary'; phase: Phase; entryCard?: boolean; hideTitle?: boolean; continued?: boolean; featured?: boolean };
export type LayoutRow = { cells: Fragment[]; paired: boolean; layout?: PortfolioLayout };
export type PagePlan = { kind: FrameKind; phase: Phase; rows: LayoutRow[]; secondary: Fragment[]; chapter?: CVSection };
export const layoutSpecs: Record<TemplateId, { family: string; name: string; color: string; description: string; category: string }> = {
  nordic: { family: 'bento', name: 'Orbit', color: '#2667c9', description: 'Runde Boards und großzügige, klare Module.', category: 'ROUND BENTO' },
  mono: { family: 'dashboard', name: 'Grid', color: '#df9d25', description: 'Präzise Tabellenzellen und ein quadratisches Raster.', category: 'ENGINEERING MATRIX' },
  editorial: { family: 'magazine', name: 'Folio', color: '#a65e42', description: 'Ein offener Magazinfluss mit großer Serifentypografie.', category: 'EDITORIAL MAGAZINE' },
  executive: { family: 'timeline', name: 'Vector', color: '#4168d5', description: 'Eine kantige Zeitleiste und markante Datumsfelder.', category: 'ANGULAR TIMELINE' },
  studio: { family: 'poster', name: 'Signal', color: '#e34732', description: 'Große Typografie, breite Bänder und Schweizer Klarheit.', category: 'SWISS POSTER' },
  haven: { family: 'organic', name: 'Haven', color: '#6e8d74', description: 'Weiche organische Flächen mit persönlicher Wärme.', category: 'SOFT ORGANIC' },
  copper: { family: 'dark-spread', name: 'Copper', color: '#c38d65', description: 'Dunkles Espressopapier mit warmer, heller Schrift.', category: 'FULL DARK LUXURY' },
  noir: { family: 'ledger', name: 'Noir', color: '#333c50', description: 'Eine kontrastreiche, horizontale Informationsarchitektur.', category: 'BRUTAL LEDGER' },
  lumen: { family: 'portfolio', name: 'Lumen', color: '#8a70c7', description: 'Asymmetrische Projektflächen und ein versetztes Porträt.', category: 'ASYMMETRIC PORTFOLIO' },
  summit: { family: 'split', name: 'Summit', color: '#cb963d', description: 'Eine architektonische Teilung mit eigenem Qualifikationsraster.', category: 'ARCHITECTURAL SPLIT' },
};
export const chapterTemplates = new Set<TemplateId>(['editorial', 'studio', 'noir']);
export const isTraining = (section?: CVSection) => !!section && /weiterbildung|fortbildung|training|zertifikat|certif/i.test(section.title);
export function sectionLane(section: CVSection): 'main' | 'sidebar' {
  if (section.placement && section.placement !== 'auto') return section.placement;
  return section.kind === 'skills' || /stärken|soft.?skills|sprachen|interessen|hobbys|referenzen|kontakt|führerschein/i.test(section.title) ? 'sidebar' : 'main';
}
export function textChunks(value: string, size = 220): { value: string; start: number; end: number }[] {
  if (!value) return [];
  const result = []; const links = textLinks(value); let start = 0;
  while (start < value.length) {
    let end = Math.min(start + size, value.length);
    if (end < value.length) { const space = value.lastIndexOf(' ', end); if (space > start + size / 2) end = space + 1; }
    const crossing = links.find(link => link.start < end && link.end > end);
    if (crossing) end = crossing.start > start ? crossing.start : crossing.end;
    result.push({ value: value.slice(start, end), start, end }); start = end;
  }
  return result;
}
function sectionUnits(section: CVSection): Unit[] {
  const result: Unit[] = [];
  for (const entry of section.entries) {
    const headings = textChunks(entry.heading, 180), subheadings = textChunks(entry.subheading, 220), periods = textChunks(entry.period, 100);
    result.push({ key: `${entry.id}-entry`, type: 'entry', section, entry, value: headings[0]?.value || '', start: 0, end: headings[0]?.end || 0, keep: headings.length > 1 || !!entry.subheading || !!entry.body || !!entry.image });
    headings.slice(1).forEach((chunk, index) => result.push({ key: `${entry.id}-heading-${index}`, type: 'field', field: 'heading', section, entry, ...chunk, keep: index === headings.length - 2 && !!subheadings.length }));
    periods.slice(1).forEach((chunk, index) => result.push({ key: `${entry.id}-period-${index}`, type: 'field', field: 'period', section, entry, ...chunk }));
    subheadings.forEach((chunk, index) => result.push({ key: `${entry.id}-subheading-${index}`, type: 'field', field: 'subheading', section, entry, ...chunk, keep: index === subheadings.length - 1 && (!!entry.body || !!entry.image) }));
    entry.body.split('\n').forEach((line, lineIndex) => {
      if (!line.trim()) return;
      textChunks(line, 220).forEach((chunk, index) => result.push({ key: `${entry.id}-body-${lineIndex}-${index}`, type: 'body', section, entry, ...chunk, line: lineIndex, continued: index > 0 }));
    });
    if (entry.image) result.push({ key: `${entry.id}-image`, type: 'image', section, entry });
  }
  if (!section.entries.length) result.push({ key: `${section.id}-empty`, type: 'empty', section });
  return result;
}
export function buildFragments(doc: CVDocument): Fragment[] {
  const result: Fragment[] = [];
  const summary = textChunks(doc.summary, 220).map((chunk, index) => ({ key: `summary-${index}`, type: 'summary' as const, ...chunk }));
  if (summary.length) result.push({ key: 'summary', units: summary, role: 'primary', phase: 'career' });
  const visible = doc.sections.filter(section => section.visible);
  // A qualification chapter only follows an initial career run. A manually reordered
  // education/project section keeps its source position; no seed-specific IDs are used.
  const career = (section: CVSection) => section.kind === 'experience' || /projekt|projects|portfolio/i.test(section.title);
  const beginsWithCareer = !!visible.length && career(visible[0]);
  let qualification = !beginsWithCareer;
  for (const section of visible) {
    if (beginsWithCareer && !career(section)) qualification = true;
    const phase: Phase = qualification ? 'qualifications' : 'career';
    const role = sectionLane(section) === 'sidebar' ? 'secondary' : 'primary';
    const units = sectionUnits(section);
    const cards = (['nordic', 'mono', 'lumen'].includes(doc.design.template) && section.kind === 'experience')
      || (doc.design.template === 'nordic' && phase === 'qualifications')
      || (doc.design.template === 'copper' && phase === 'qualifications' && section.kind === 'education' && !isTraining(section) && section.entries.length > 1);
    if (cards && section.entries.length) {
      section.entries.forEach((entry, index) => result.push({ key: `${section.id}:${entry.id}`, section, units: units.filter(unit => unit.entry?.id === entry.id), role, phase, entryCard: true, hideTitle: index > 0, featured: index === 0 }));
    } else result.push({ key: section.id, section, units, role, phase });
  }
  return result;
}
export function wantsPair(fragment: Fragment, template: TemplateId): boolean {
  if (template === 'lumen') return false;
  if (fragment.continued) return false;
  if (fragment.section?.placement === 'main') return false;
  if (fragment.entryCard) return fragment.units.reduce((sum, unit) => sum + (unit.value?.length || 0), 0) < 240;
  if (fragment.phase !== 'qualifications' || !fragment.section) return false;
  if (['editorial', 'studio', 'noir'].includes(template)) return false;
  if (fragment.section.kind === 'skills') return false;
  if (isTraining(fragment.section) && fragment.section.placement !== 'sidebar' && template !== 'nordic') return false;
  return true;
}
export type LayoutMeasure = {
  height: (fragment: Fragment, slot: Slot, kind: FrameKind, chapter?: CVSection) => number;
  capacity: (kind: FrameKind, slot?: Slot, chapter?: CVSection) => number;
  gap: (kind: FrameKind) => number;
  groupHeight?: (cells: Fragment[], layout: PortfolioLayout, kind: FrameKind) => number;
};
function portfolioGroup(queue: Fragment[]): PortfolioLayout | undefined {
  const [context, main, support] = queue;
  if (!support || [context, main, support].some(fragment => fragment.continued || fragment.section?.placement === 'main')) return;
  if (!context.section && context.phase === 'career' && main.phase === 'career' && support.phase === 'career'
    && main.entryCard && support.entryCard && main.section?.kind === 'experience' && main.section.id === support.section?.id) return 'portfolio-feature';
  if (context.phase === 'qualifications' && main.phase === 'qualifications' && support.phase === 'qualifications'
    && context.section?.kind === 'education' && !isTraining(context.section) && isTraining(main.section)
    && support.section?.kind === 'education' && !isTraining(support.section)) return 'portfolio-credentials';
}
export function paginateFragments(fragments: Fragment[], template: TemplateId, measure: LayoutMeasure): PagePlan[] {
  const queue = fragments.map(fragment => ({ ...fragment, units: [...fragment.units] }));
  const result: PagePlan[] = []; let used = 0; let sideUsed = 0;
  let page: PagePlan = { kind: 'first', phase: fragments[0]?.phase || 'career', rows: [], secondary: [] };
  // Summit intentionally has two semantic reading areas on its first page.
  // Bring fitting secondary modules into the identity block, retaining their
  // source order. Overflow remains in the original stream on following pages.
  if (template === 'summit') {
    for (const fragment of [...queue]) {
      if (fragment.role !== 'secondary') continue;
      const gap = page.secondary.length ? measure.gap('first') : 0;
      const height = measure.height(fragment, 'secondary', 'first');
      if (sideUsed + gap + height > measure.capacity('first', 'secondary')) break;
      page.secondary.push(fragment); sideUsed += gap + height; queue.splice(queue.indexOf(fragment), 1);
    }
  }
  const flush = (phase: Phase) => {
    if (page.rows.length || page.secondary.length || page.kind === 'first') result.push(page);
    const firstQualification = phase === 'qualifications' && !result.some(item => item.phase === 'qualifications' && item.kind !== 'first');
    page = { kind: phase === 'career' ? 'career' : firstQualification ? 'qualifications' : 'qualifications-continued', phase, rows: [], secondary: [] };
    if (firstQualification && chapterTemplates.has(template)) page.chapter = queue.find(fragment => fragment.section)?.section;
    used = 0; sideUsed = 0;
  };
  const slice = (fragment: Fragment, available: number, slot: Slot): [Fragment, Fragment | undefined] => {
    let low = 1, high = fragment.units.length, fit = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidate = { ...fragment, units: fragment.units.slice(0, mid) };
      if (measure.height(candidate, slot, page.kind, page.chapter) <= available) { fit = mid; low = mid + 1; } else high = mid - 1;
    }
    // Keep labels and their first real content together whenever a whole chain fits.
    if (fit && fit < fragment.units.length) {
      let safe = fit;
      while (safe > 0 && fragment.units[safe - 1].keep) safe -= 1;
      if (safe > 0) fit = safe;
    }
    fit = Math.max(1, fit);
    const head = { ...fragment, units: fragment.units.slice(0, fit) };
    const sourceKey = fragment.sourceKey || fragment.key;
    const tail = fit < fragment.units.length ? { ...fragment, sourceKey, key: `${sourceKey}~${fragment.units[fit].key}`, units: fragment.units.slice(fit), continued: true, hideTitle: false, featured: false } : undefined;
    return [head, tail];
  };
  while (queue.length) {
    const fragment = queue[0];
    if (page.kind === 'first' && page.phase === 'career' && fragment.phase === 'qualifications' && used > measure.capacity('first') * .45) {
      const remaining = queue.reduce((sum, item) => sum + measure.height(item, 'full', 'qualifications'), 0);
      if (remaining > 220) { flush('qualifications'); continue; }
    }
    const splitSide = template === 'summit' && page.kind === 'first' && fragment.role === 'secondary';
    const slot: Slot = template === 'summit' && page.kind === 'first' ? splitSide ? 'secondary' : 'primary' : 'full';
    const gap = (splitSide ? page.secondary.length : page.rows.length) ? measure.gap(page.kind) : 0;
    const capacity = measure.capacity(page.kind, slot, page.chapter);
    const occupied = splitSide ? sideUsed : used;
    const available = capacity - occupied - gap;
    // A portfolio spread is one real, measured CSS grid. Its source-ordered
    // fragments stay together only when the complete asymmetric group fits;
    // arbitrary or oversized content falls back to the normal splitting path.
    const layout = template === 'lumen' && slot === 'full' ? portfolioGroup(queue) : undefined;
    if (layout && measure.groupHeight) {
      const groupHeight = measure.groupHeight(queue.slice(0, 3), layout, page.kind);
      if (groupHeight <= available) {
        page.rows.push({ cells: queue.splice(0, 3), paired: false, layout }); used += gap + groupHeight; continue;
      }
    }
    const height = measure.height(fragment, slot, page.kind, page.chapter);
    const pair = !splitSide && slot === 'full' && wantsPair(fragment, template) && queue[1] && queue[1].phase === fragment.phase && wantsPair(queue[1], template);
    if (pair) {
      const pairHeight = Math.max(measure.height(fragment, 'left', page.kind, page.chapter), measure.height(queue[1], 'right', page.kind, page.chapter));
      if (pairHeight <= available) {
        page.rows.push({ cells: queue.splice(0, 2), paired: true }); used += gap + pairHeight; continue;
      }
    }
    if (height <= available) {
      queue.shift();
      if (splitSide) { page.secondary.push(fragment); sideUsed += gap + height; }
      else { page.rows.push({ cells: [fragment], paired: false }); used += gap + height; }
      continue;
    }
    const firstUnitHeight = measure.height({ ...fragment, units: fragment.units.slice(0, 1) }, slot, page.kind, page.chapter);
    if (page.kind === 'first' && firstUnitHeight > available && firstUnitHeight <= measure.capacity(fragment.phase === 'career' ? 'career' : 'qualifications', 'full')) {
      flush(fragment.phase); continue;
    }
    // Move a complete record/panel to the next page before attempting a split.
    if (occupied > 0 && height <= measure.capacity(fragment.phase === 'career' ? 'career' : 'qualifications', 'full')) { flush(fragment.phase); continue; }
    if (available < 100 && occupied > 0) { flush(fragment.phase); continue; }
    const [head, tail] = slice(fragment, Math.max(100, available), slot);
    queue.shift(); if (tail) queue.unshift(tail);
    const actualHeight = measure.height(head, slot, page.kind, page.chapter);
    if (splitSide) { page.secondary.push(head); sideUsed += gap + actualHeight; }
    else { page.rows.push({ cells: [head], paired: false }); used += gap + actualHeight; }
    if (tail) flush(tail.phase);
  }
  if (page.rows.length || page.secondary.length || !result.length) result.push(page);
  return result;
}

function luminance(hex: string) {
  const channels = hex.match(/[a-f\d]{2}/gi)!.map(channel => { const value = parseInt(channel, 16) / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
export function accentColors(accent: string, dark = false) {
  const paper = dark ? '#211c19' : '#ffffff';
  const ratio = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
  let ink = accent; const destination = dark ? [255, 241, 224] : [18, 32, 50];
  const channels = accent.match(/[a-f\d]{2}/gi)!.map(channel => parseInt(channel, 16));
  for (let amount = 0; amount <= 1 && ratio(ink, paper) < 5; amount += .025) ink = `#${channels.map((channel, index) => Math.round(channel * (1 - amount) + destination[index] * amount).toString(16).padStart(2, '0')).join('')}`;
  return { '--cv-accent': accent, '--cv-accent-ink': ink, '--cv-on-accent': ratio(accent, '#ffffff') >= ratio(accent, '#000000') ? '#ffffff' : '#000000' };
}
