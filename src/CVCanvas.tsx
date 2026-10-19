import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUp, Camera, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CVDocument, CVEntry, CVSection, IconName } from './model';
import { safeLink } from './model';
import { sectionIcons, type IconTarget } from './icons';
import { textLinks } from './textLinks';

type EntryField = 'heading' | 'subheading' | 'period' | 'body';
type ProfileField = 'name' | 'title' | 'email' | 'phone' | 'address';
type Lane = 'main' | 'sidebar';
type Unit = {
  key: string; type: 'summary' | 'section' | 'entry' | 'field' | 'body' | 'image' | 'empty';
  section?: CVSection; entry?: CVEntry; value?: string; field?: EntryField;
  start?: number; end?: number; line?: number; continued?: boolean; keep?: boolean;
};
interface CanvasProps {
  doc: CVDocument; editing: boolean; readonly?: boolean;
  update: (fn: (doc: CVDocument) => CVDocument) => void;
  onPhoto: () => void; onEditEntry: (sectionId: string, entryId?: string) => void;
  onDeleteEntry: (sectionId: string, entryId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, offset: number) => void;
  onMoveEntry: (sectionId: string, entryId: string, offset: number) => void;
  onIcon: (target: IconTarget) => void; onAddSection: () => void;
  onPages: (count: number) => void;
}

export function Editable({ value, onChange, editing, className = '', placeholder = '', as = 'span' }: {
  value: string; onChange: (value: string) => void; editing: boolean; className?: string;
  placeholder?: string; as?: 'span' | 'div' | 'h1' | 'p';
}) {
  const element = useRef<HTMLElement>(null);
  const Tag = as;
  const valueRef = useRef(value); valueRef.current = value;
  const changeRef = useRef(onChange); changeRef.current = onChange;
  const flush = () => {
    if (!editing || !element.current) return;
    const next = element.current.innerText.replace(/\u00a0/g, ' ');
    if (next !== valueRef.current) changeRef.current(next);
  };
  useLayoutEffect(() => {
    if (element.current && document.activeElement !== element.current && element.current.innerText !== value) element.current.textContent = value;
  }, [value]);
  return <Tag ref={element as never} className={`editable ${className} ${editing ? 'is-editable' : ''}`}
    contentEditable={editing} suppressContentEditableWarning spellCheck={editing} data-placeholder={placeholder}
    aria-label={editing ? placeholder || 'Text bearbeiten' : undefined}
    onBlur={flush}
    onPaste={event => { if (editing) { event.preventDefault(); document.execCommand('insertText', false, event.clipboardData.getData('text/plain')); } }}
  >{editing ? value : linkedText(value)}</Tag>;
}

function linkedText(value: string): ReactNode {
  const links = textLinks(value);
  if (!links.length) return value;
  const nodes: ReactNode[] = []; let cursor = 0;
  for (const link of links) {
    nodes.push(value.slice(cursor, link.start));
    nodes.push(<a key={link.start} className="cv-inline-link" href={link.href} target={link.email ? undefined : '_blank'} rel={link.email ? undefined : 'noopener noreferrer'}>{link.text}</a>);
    cursor = link.end;
  }
  nodes.push(value.slice(cursor)); return nodes;
}

function textChunks(value: string, size = 220): { value: string; start: number; end: number }[] {
  if (!value) return [];
  const result: { value: string; start: number; end: number }[] = []; const links = textLinks(value); let start = 0;
  while (start < value.length) {
    let end = Math.min(start + size, value.length);
    if (end < value.length) { const space = value.lastIndexOf(' ', end); if (space > start + size / 2) end = space + 1; }
    const crossingLink = links.find(link => link.start < end && link.end > end);
    if (crossingLink) end = crossingLink.start > start ? crossingLink.start : crossingLink.end;
    result.push({ value: value.slice(start, end), start, end }); start = end;
  }
  return result;
}

export function sectionLane(section: CVSection): Lane {
  if (section.placement && section.placement !== 'auto') return section.placement;
  if (section.kind === 'skills' || /stärken|soft.?skills|sprachen|interessen|hobbys|referenzen|kontakt|führerschein/i.test(section.title)) return 'sidebar';
  return 'main';
}

function makeUnits(doc: CVDocument, lane: Lane): Unit[] {
  const units: Unit[] = []; const chunkSize = lane === 'sidebar' ? 110 : 240;
  if (lane === 'main') textChunks(doc.summary, 240).forEach((chunk, index) => units.push({ key: `summary-${index}`, type: 'summary', ...chunk }));
  doc.sections.filter(section => section.visible && sectionLane(section) === lane).forEach(section => {
    units.push({ key: `${section.id}-section`, type: 'section', section, keep: section.entries.length > 0 });
    if (!section.entries.length) units.push({ key: `${section.id}-empty`, type: 'empty', section });
    section.entries.forEach(entry => {
      const headings = textChunks(entry.heading, lane === 'sidebar' ? 100 : 180);
      const subheadings = textChunks(entry.subheading, chunkSize);
      const periods = textChunks(entry.period, 100);
      units.push({ key: `${entry.id}-entry`, type: 'entry', section, entry, value: headings[0]?.value || '', start: 0, end: headings[0]?.end || 0,
        keep: headings.length > 1 || subheadings.length > 0 || !!entry.body || !!entry.image });
      headings.slice(1).forEach((chunk, index) => units.push({ key: `${entry.id}-heading-${index}`, type: 'field', field: 'heading', section, entry, ...chunk, keep: index === headings.length - 2 && !!subheadings.length }));
      periods.slice(1).forEach((chunk, index) => units.push({ key: `${entry.id}-period-${index}`, type: 'field', field: 'period', section, entry, ...chunk }));
      subheadings.forEach((chunk, index) => units.push({ key: `${entry.id}-subheading-${index}`, type: 'field', field: 'subheading', section, entry, ...chunk,
        keep: index === subheadings.length - 1 && (!!entry.body || !!entry.image) }));
      entry.body.split('\n').forEach((line, lineIndex) => {
        if (!line.trim()) return;
        textChunks(line, chunkSize).forEach((chunk, index) => units.push({ key: `${entry.id}-body-${lineIndex}-${index}`, type: 'body', section, entry,
          ...chunk, line: lineIndex, continued: index > 0 }));
      });
      if (entry.image) units.push({ key: `${entry.id}-image`, type: 'image', section, entry });
    });
  });
  return units;
}

function PrintedIcon({ name, editing, onClick, label, section = false }: { name: IconName; editing: boolean; onClick: () => void; label: string; section?: boolean }) {
  const Icon = sectionIcons[name];
  if (name === 'none') return editing ? <button type="button" className="cv-icon-restore" onClick={onClick} aria-label={`${label}: Symbol hinzufügen`} title="Symbol hinzufügen" data-editor-only><Plus size={12} /></button> : null;
  return editing ? <button type="button" className={`cv-printed-icon ${section ? 'cv-section-icon' : 'cv-contact-icon'}`} onClick={onClick} aria-label={`${label}: Symbol ändern oder entfernen`} title="Symbol ändern oder entfernen"><Icon size={16} strokeWidth={1.65} /></button> : <span className={`cv-printed-icon ${section ? 'cv-section-icon' : 'cv-contact-icon'}`}><Icon size={16} strokeWidth={1.65} /></span>;
}

function ContactLinks({ doc, editing, onProfile, onLink, onIcon }: { doc: CVDocument; editing: boolean; onProfile: (field: ProfileField, value: string) => void; onLink: (id: string, field: 'label' | 'url', value: string) => void; onIcon: (target: IconTarget) => void }) {
  const contacts: { field: 'email' | 'phone' | 'address'; value: string; label: string; icon: IconName; href: string; external?: boolean }[] = [
    { field: 'email', value: doc.email, label: 'E-Mail', icon: doc.contactIcons?.email ?? 'mail', href: `mailto:${doc.email}` },
    { field: 'phone', value: doc.phone, label: 'Telefon', icon: doc.contactIcons?.phone ?? 'phone', href: `tel:${doc.phone.replace(/[^+\d]/g, '')}` },
    { field: 'address', value: doc.address, label: 'Adresse', icon: doc.contactIcons?.address ?? 'map-pin', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.address)}`, external: true },
  ];
  return <div className="cv-contact">
    {contacts.filter(contact => contact.value || editing).map(contact => <div className={`cv-contact-row ${contact.icon === 'none' ? 'without-icon' : ''}`} key={contact.field}>
      <PrintedIcon name={contact.icon} editing={editing} label={contact.label} onClick={() => onIcon({ kind: 'contact', field: contact.field })} />
      {editing ? <Editable value={contact.value} editing placeholder={contact.label} onChange={value => onProfile(contact.field, value)} /> : <a href={contact.href} target={contact.external ? '_blank' : undefined} rel={contact.external ? 'noopener noreferrer' : undefined}>{contact.value}</a>}
    </div>)}
    {doc.links.filter(link => editing || safeLink(link.url)).map(link => <div className={`cv-contact-row cv-contact-link ${link.icon === 'none' ? 'without-icon' : ''}`} key={link.id}>
      <PrintedIcon name={link.icon ?? 'link'} editing={editing} label={link.label || 'Weblink'} onClick={() => onIcon({ kind: 'link', id: link.id })} />
      {editing ? <div className="cv-link-edit-fields"><Editable value={link.label} editing placeholder="Link-Bezeichnung" onChange={value => onLink(link.id, 'label', value)} /><Editable value={link.url} editing placeholder="https://…" onChange={value => onLink(link.id, 'url', value)} /></div> : <a href={safeLink(link.url)} target="_blank" rel="noopener noreferrer">{link.label || link.url}</a>}
    </div>)}
  </div>;
}

function Portrait({ doc, editing, onPhoto, readonly = false }: { doc: CVDocument; editing: boolean; onPhoto: () => void; readonly?: boolean }) {
  if (!doc.design.showPhoto) return null;
  const initials = doc.name.trim().split(/\s+/).map(word => word[0]).slice(0, 2).join('');
  const content = doc.photo ? <img src={doc.photo} alt={doc.name ? `Porträt von ${doc.name}` : 'Porträt'} /> : <span className="cv-initials" aria-label={initials ? `Initialen ${initials}` : undefined}>{initials}</span>;
  return <div className={`cv-photo photo-${doc.design.photoShape} ${!doc.photo ? 'has-initials' : ''}`}>
    {!readonly && (editing || !doc.photo) ? <button type="button" className="cv-photo-button" onClick={onPhoto} title="Profilfoto hochladen" aria-label="Profilfoto hochladen">{content}<span className="photo-change" data-editor-only><Camera size={15} /><span>{doc.photo ? 'Foto ändern' : 'Foto hochladen'}</span></span></button> : content}
  </div>;
}

const topIdentity = new Set(['studio', 'noir', 'lumen']);
const sideIdentity = new Set(['haven', 'summit']);
function PageFrame({ doc, first, pageIndex, totalPages, editing, onPhoto, onProfile, onLink, onIcon, main, sidebar, wide = false, measure = false, readonly = false }: {
  doc: CVDocument; first: boolean; pageIndex: number; totalPages: number; editing: boolean; onPhoto: () => void;
  onProfile: (field: ProfileField, value: string) => void; onLink: (id: string, field: 'label' | 'url', value: string) => void; onIcon: (target: IconTarget) => void;
  main: ReactNode; sidebar: ReactNode; wide?: boolean; measure?: boolean; readonly?: boolean;
}) {
  const template = doc.design.template;
  const identity = (position: string) => <header className={`cv-identity cv-${position}-identity`}><Editable as="h1" className="cv-name" value={doc.name} editing={editing} placeholder="Dein Name" onChange={value => onProfile('name', value)} /><Editable as="div" className="cv-role" value={doc.title} editing={editing} placeholder="Berufsbezeichnung" onChange={value => onProfile('title', value)} /></header>;
  return <article className={`${measure ? 'cv-measure-page' : 'cv-page'} template-${template} density-${doc.design.density} font-${doc.design.font} ${first ? 'is-first' : 'is-continuation'} ${wide ? 'sidebar-exhausted' : ''} ${editing ? 'canvas-editing' : ''}`}
    style={{ '--cv-accent': doc.design.color } as CSSProperties} aria-label={measure ? undefined : `Lebenslauf, Seite ${pageIndex + 1} von ${totalPages}`}>
    <div className="cv-page-inner">
      {first && topIdentity.has(template) && identity('top')}
      {!first && <div className="cv-running-head"><span>{doc.name}</span><span>{doc.title}</span></div>}
      <div className="cv-columns">
        <aside className="cv-sidebar">
          {first && <div className="cv-sidebar-profile"><Portrait doc={doc} editing={editing} onPhoto={onPhoto} readonly={readonly} />{sideIdentity.has(template) && identity('sidebar')}<ContactLinks doc={doc} editing={editing} onProfile={onProfile} onLink={onLink} onIcon={onIcon} /></div>}
          <div className="cv-sidebar-content cv-lane-content">{sidebar}</div>
        </aside>
        <main className="cv-main">
          {first && !topIdentity.has(template) && !sideIdentity.has(template) && identity('main')}
          <div className="cv-main-content cv-content cv-lane-content">{main}</div>
        </main>
      </div>
    </div>
    {doc.design.showFooter !== false && <footer className="cv-footer"><span>{doc.name}</span><span>{String(pageIndex + 1).padStart(2, '0')}<span className="footer-slash"> / </span>{String(totalPages).padStart(2, '0')}</span></footer>}
  </article>;
}

export default function CVCanvas(props: CanvasProps) {
  const { doc, editing, update, onPages } = props;
  const lanes = useMemo(() => ({ main: makeUnits(doc, 'main'), sidebar: makeUnits(doc, 'sidebar') }), [doc]);
  const measurement = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<{ main: Unit[]; sidebar: Unit[] }[]>([{ main: lanes.main, sidebar: lanes.sidebar }]);
  const [measured, setMeasured] = useState(false);
  const patchEntry = (sectionId: string, entryId: string, field: EntryField, value: string, start?: number, end?: number, line?: number) => {
    update(current => ({ ...current, sections: current.sections.map(section => section.id !== sectionId ? section : { ...section, entries: section.entries.map(entry => {
      if (entry.id !== entryId) return entry;
      let next = value;
      if (field === 'body' && line !== undefined) { const lines = entry.body.split('\n'); const original = lines[line] || ''; lines[line] = start !== undefined ? original.slice(0, start) + value + original.slice(end) : value; next = lines.join('\n'); }
      else if (start !== undefined) next = entry[field].slice(0, start) + value + entry[field].slice(end);
      return { ...entry, [field]: next };
    }) }) }));
  };
  const patchProfile = (field: ProfileField, value: string) => update(current => ({ ...current, [field]: value }));
  const patchLink = (id: string, field: 'label' | 'url', value: string) => update(current => ({ ...current, links: current.links.map(link => link.id === id ? { ...link, [field]: value } : link) }));
  const moveLane = (section: CVSection) => update(current => ({ ...current, sections: current.sections.map(item => item.id === section.id ? { ...item, placement: sectionLane(item) === 'main' ? 'sidebar' : 'main' } : item) }));

  function renderUnit(unit: Unit, index: number, isMeasure = false) {
    const { section, entry } = unit; const edit = editing;
    const data = { 'data-unit-index': isMeasure ? index : undefined, 'data-unit-key': unit.key };
    if (unit.type === 'summary') return <div className="cv-unit cv-summary" key={unit.key} {...data}><Editable as="p" value={unit.value || ''} editing={edit} placeholder="Dein Profil" onChange={value => update(current => ({ ...current, summary: current.summary.slice(0, unit.start) + value + current.summary.slice(unit.end) }))} /></div>;
    if (!section) return null;
    if (unit.type === 'section') return <div className={`cv-unit cv-section-heading ${unit.continued ? 'section-continued' : ''} ${!section.title && section.icon === 'none' ? 'is-blank-heading' : ''}`} key={unit.key} {...data}>
      <div className="section-heading-inner"><PrintedIcon name={section.icon} editing={edit} section label={section.title || 'Abschnitt'} onClick={() => props.onIcon({ kind: 'section', id: section.id })} /><Editable value={section.title} editing={edit} placeholder="Abschnittstitel" onChange={value => update(current => ({ ...current, sections: current.sections.map(item => item.id === section.id ? { ...item, title: value } : item) }))} /><span className="cv-section-rule" /></div>
      {edit && !unit.continued && <div className="canvas-section-actions" data-editor-only>
        <button onClick={() => moveLane(section)} title="In andere Spalte verschieben" aria-label="In andere Spalte verschieben"><ArrowLeftRight size={13} /></button>
        <button onClick={() => props.onMoveSection(section.id, -1)} title="Abschnitt nach oben" aria-label="Abschnitt nach oben"><ArrowUp size={13} /></button><button onClick={() => props.onMoveSection(section.id, 1)} title="Abschnitt nach unten" aria-label="Abschnitt nach unten"><ArrowDown size={13} /></button>
        <button onClick={() => props.onEditEntry(section.id)} title="Eintrag hinzufügen" aria-label="Eintrag hinzufügen"><Plus size={13} /></button><button onClick={() => props.onDeleteSection(section.id)} title="Abschnitt löschen" aria-label="Abschnitt löschen"><Trash2 size={13} /></button>
      </div>}
    </div>;
    if (unit.type === 'empty') return <div className="cv-unit cv-empty-section" key={unit.key} {...data}>{edit && <button onClick={() => props.onEditEntry(section.id)} data-editor-only><Plus size={13} /> Eintrag hinzufügen</button>}</div>;
    if (!entry) return null;
    if (unit.type === 'entry') return <div className={`cv-unit cv-entry-header kind-${section.kind} ${!unit.value && !entry.period ? 'empty-entry-header' : ''}`} key={unit.key} {...data}>
      <Editable className="cv-period" value={textChunks(entry.period, 100)[0]?.value || ''} editing={edit} placeholder="Zeitraum" onChange={value => patchEntry(section.id, entry.id, 'period', value, 0, textChunks(entry.period, 100)[0]?.end || 0)} />
      <Editable className="cv-entry-heading" value={unit.value || ''} editing={edit} placeholder="Titel oder Unternehmen" onChange={value => patchEntry(section.id, entry.id, 'heading', value, unit.start, unit.end)} />
      {edit && <div className="canvas-entry-actions" data-editor-only><button title="Eintrag bearbeiten" aria-label="Eintrag bearbeiten" onClick={() => props.onEditEntry(section.id, entry.id)}><Pencil size={12} /></button><button title="Eintrag nach oben" aria-label="Eintrag nach oben" onClick={() => props.onMoveEntry(section.id, entry.id, -1)}><ArrowUp size={12} /></button><button title="Eintrag nach unten" aria-label="Eintrag nach unten" onClick={() => props.onMoveEntry(section.id, entry.id, 1)}><ArrowDown size={12} /></button><button title="Eintrag löschen" aria-label="Eintrag löschen" onClick={() => props.onDeleteEntry(section.id, entry.id)}><Trash2 size={12} /></button></div>}
    </div>;
    if (unit.type === 'field') return <div className={`cv-unit cv-entry-field field-${unit.field} kind-${section.kind}`} key={unit.key} {...data}><Editable value={unit.value || ''} editing={edit} placeholder={unit.field === 'subheading' ? 'Position oder Abschluss' : 'Text bearbeiten'} onChange={value => patchEntry(section.id, entry.id, unit.field!, value, unit.start, unit.end)} /></div>;
    if (unit.type === 'image') return <div className={`cv-unit cv-entry-image kind-${section.kind}`} key={unit.key} {...data}><img src={entry.image} alt={entry.heading ? `Bild zu ${entry.heading}` : 'Bild zum Eintrag'} onLoad={() => window.dispatchEvent(new Event('cv-image-load'))} />{edit && <button data-editor-only title="Bild ersetzen" onClick={() => props.onEditEntry(section.id, entry.id)}><ImagePlus size={14} /></button>}</div>;
    return <div className={`cv-unit cv-body-line kind-${section.kind} ${unit.continued ? 'line-continuation' : ''}`} key={unit.key} {...data}>{section.kind === 'experience' && !unit.continued && <span className="cv-bullet" />}<Editable value={unit.value || ''} editing={edit} placeholder="Beschreibung" onChange={value => patchEntry(section.id, entry.id, 'body', value, unit.start, unit.end, unit.line)} /></div>;
  }

  useLayoutEffect(() => {
    setMeasured(false);
    let cancelled = false; let timer = 0;
    const measure = () => {
      const root = measurement.current; if (!root || cancelled) return;
      const frames = Array.from(root.querySelectorAll<HTMLElement>('.cv-measure-page')); if (frames.length !== 3) return;
      const scales = frames.map(frame => frame.getBoundingClientRect().width / 794 || 1);
      const capacities = frames.map((frame, frameIndex) => {
        const frameRect = frame.getBoundingClientRect(); const footer = frame.querySelector<HTMLElement>('.cv-footer');
        const bottom = footer ? footer.getBoundingClientRect().top / scales[frameIndex] - 18 : frameRect.top / scales[frameIndex] + 1073;
        return Object.fromEntries((['main', 'sidebar'] as const).map(lane => { const element = frame.querySelector<HTMLElement>(`.cv-${lane}-content`)!; return [lane, Math.max(100, bottom - element.getBoundingClientRect().top / scales[frameIndex])]; })) as Record<Lane, number>;
      });
      const heights = frames.map((frame, frameIndex) => Object.fromEntries((['main', 'sidebar'] as const).map(lane => {
        const map = new Map<number, number>(); frame.querySelector(`.cv-${lane}-content`)?.querySelectorAll<HTMLElement>('[data-unit-index]').forEach(element => map.set(Number(element.dataset.unitIndex), element.getBoundingClientRect().height / scales[frameIndex])); return [lane, map];
      })) as Record<Lane, Map<number, number>>);
      const paginate = (lane: Lane, sidebarPages = Infinity): Unit[][] => {
        const units = lanes[lane]; const result: Unit[][] = []; let page: Unit[] = []; let used = 0;
        const frameFor = () => result.length === 0 ? 0 : lane === 'main' && result.length >= sidebarPages ? 2 : 1;
        const limit = () => capacities[frameFor()][lane]; const height = (index: number) => heights[frameFor()][lane].get(index) || 0;
        const flush = () => { result.push(page); page = []; used = 0; };
        const continuation = (unit: Unit) => {
          if (!result.length || unit.type === 'section' || !unit.section) return;
          const originalIndex = units.findIndex(item => item.type === 'section' && item.section?.id === unit.section?.id);
          if (originalIndex < 0) return;
          page.push({ ...units[originalIndex], key: `${unit.key}-continuation`, continued: true, keep: false }); used += height(originalIndex);
        };
        for (let index = 0; index < units.length; index++) {
          const unit = units[index];
          let required = height(index); let cursor = index;
          while (units[cursor]?.keep && units[cursor + 1]) { cursor += 1; required += height(cursor); }
          if (required > limit()) required = height(index);
          if (page.length && used + required > limit()) flush();
          if (!page.length) continuation(unit);
          // Recalculate after a page transition: continuation width may have expanded.
          if (used + height(index) > limit() && page.some(item => !item.continued)) { flush(); continuation(unit); }
          page.push(unit); used += height(index);
        }
        if (page.length || !result.length) result.push(page); return result;
      };
      const sidebar = paginate('sidebar'); const main = paginate('main', sidebar.length);
      const result = Array.from({ length: Math.max(main.length, sidebar.length) }, (_, index) => ({ main: main[index] || [], sidebar: sidebar[index] || [] }));
      setPages(result); setMeasured(true); onPages(result.length);
    };
    timer = window.setTimeout(measure, 35); void document.fonts.ready.then(() => { if (!cancelled) measure(); }); window.addEventListener('cv-image-load', measure);
    return () => { cancelled = true; window.clearTimeout(timer); window.removeEventListener('cv-image-load', measure); };
  }, [lanes, doc.design, doc.name, doc.title, doc.email, doc.phone, doc.address, doc.links, doc.photo, doc.contactIcons, editing, onPages]);
  const frameProps = { doc, onPhoto: props.onPhoto, onProfile: patchProfile, onLink: patchLink, onIcon: props.onIcon, readonly: props.readonly };
  return <>
    <div className="cv-measure-root" ref={measurement} aria-hidden="true" data-editor-only>
      {[0, 1, 2].map(index => <PageFrame key={index} {...frameProps} first={index === 0} pageIndex={index} totalPages={3} editing={editing} measure wide={index === 2} main={lanes.main.map((unit, unitIndex) => renderUnit(unit, unitIndex, true))} sidebar={lanes.sidebar.map((unit, unitIndex) => renderUnit(unit, unitIndex, true))} />)}
    </div>
    <div className={`cv-pages ${!measured ? 'is-paginating' : ''}`}>
      {pages.map((page, pageIndex) => <div className="paper-with-label" key={`${doc.design.template}-${pageIndex}`}><div className="paper-label" data-editor-only><span>SEITE {String(pageIndex + 1).padStart(2, '0')}</span><span>A4 · 210 × 297 mm</span></div><PageFrame {...frameProps} first={pageIndex === 0} pageIndex={pageIndex} totalPages={pages.length} editing={editing} wide={pageIndex > 0 && !page.sidebar.length} main={page.main.map((unit, index) => renderUnit(unit, index))} sidebar={page.sidebar.map((unit, index) => renderUnit(unit, index))} /></div>)}
      {editing && <button className="canvas-add-section" onClick={props.onAddSection} data-editor-only><Plus size={18} /> Abschnitt hinzufügen</button>}
    </div>
  </>;
}
