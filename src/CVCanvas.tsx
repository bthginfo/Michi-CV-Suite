import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUp, Camera, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CVDocument, CVSection, IconName } from './model';
import { safeLink } from './model';
import { sectionIcons, type IconTarget } from './icons';
import { textLinks } from './textLinks';
import { accentColors, buildFragments, isTraining, layoutSpecs, paginateFragments, portfolioSlots, sectionLane, textChunks, type EntryField, type Fragment, type FrameKind, type PagePlan, type PortfolioLayout, type Slot, type Unit } from './layout';
export { sectionLane } from './layout';

type ProfileField = 'name' | 'title' | 'email' | 'phone' | 'address';
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

function PageFrame({ doc, plan, pageIndex, totalPages, editing, onPhoto, onProfile, onLink, onIcon, children, secondary, chapter, measure = false, readonly = false }: {
  doc: CVDocument; plan: PagePlan; pageIndex: number; totalPages: number; editing: boolean; onPhoto: () => void;
  onProfile: (field: ProfileField, value: string) => void; onLink: (id: string, field: 'label' | 'url', value: string) => void; onIcon: (target: IconTarget) => void;
  children: ReactNode; secondary?: ReactNode; chapter?: ReactNode; measure?: boolean; readonly?: boolean;
}) {
  const first = plan.kind === 'first'; const split = first && doc.design.template === 'summit';
  const identity = <header className={`cv-identity ${first ? 'identity-first' : 'identity-continued'}`}>
    <div className="cv-identity-copy"><Editable as="h1" className="cv-name" value={doc.name} editing={editing} placeholder="Dein Name" onChange={value => onProfile('name', value)} /><Editable as="div" className="cv-role" value={doc.title} editing={editing} placeholder="Berufsbezeichnung" onChange={value => onProfile('title', value)} /></div>
    <Portrait doc={doc} editing={editing} onPhoto={onPhoto} readonly={readonly} />
    <div className="cv-identity-contact"><ContactLinks doc={doc} editing={editing} onProfile={onProfile} onLink={onLink} onIcon={onIcon} /></div>
  </header>;
  return <article className={`${measure ? 'cv-measure-page' : 'cv-page'} cv-world template-${doc.design.template} family-${layoutSpecs[doc.design.template].family} font-${doc.design.font} density-${doc.design.density} phase-${plan.phase} ${first ? 'is-first' : 'is-continuation'} ${editing ? 'canvas-editing' : ''}`}
    data-frame-kind={plan.kind} style={accentColors(doc.design.color, doc.design.template === 'copper') as CSSProperties} aria-label={measure ? undefined : `Lebenslauf, Seite ${pageIndex + 1} von ${totalPages}`}>
    <div className="cv-page-inner">
      {split ? <div className="cv-split-first"><aside className="cv-split-identity">{identity}<div className="cv-composition cv-lane-content cv-secondary-composition" data-capacity="secondary">{secondary}</div></aside><main className="cv-split-story"><div className="cv-composition cv-lane-content" data-capacity="primary">{children}</div></main></div>
      : <>{identity}{chapter && <div className="cv-chapter">{chapter}</div>}<div className="cv-composition cv-lane-content" data-capacity="full">{children}</div></>}
    </div>
    {doc.design.showFooter !== false && <footer className="cv-footer"><span>{doc.name}</span><span>{String(pageIndex + 1).padStart(2, '0')}<span className="footer-slash"> / </span>{String(totalPages).padStart(2, '0')}</span></footer>}
  </article>;
}

export default function CVCanvas(props: CanvasProps) {
  const { doc, editing, update, onPages } = props;
  const fragments = useMemo(() => buildFragments(doc), [doc]);
  const measurement = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PagePlan[]>([{ kind: 'first', phase: fragments[0]?.phase || 'career', rows: fragments.map(fragment => ({ cells: [fragment], paired: false })), secondary: [] }]);
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
        <button onClick={() => moveLane(section)} title="In anderen Bereich verschieben" aria-label="In anderen Bereich verschieben"><ArrowLeftRight size={13} /></button>
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

  function renderFragment(fragment: Fragment, probe = false, chapter?: CVSection) {
    const records: { id: string; units: Unit[] }[] = [];
    for (const unit of fragment.units) {
      const id = unit.entry?.id || 'summary';
      if (records.at(-1)?.id === id) records[records.length - 1].units.push(unit);
      else records.push({ id, units: [unit] });
    }
    const suppressed = (fragment.hideTitle && !fragment.continued) || (chapter?.id === fragment.section?.id && !fragment.continued);
    return <section key={fragment.key} data-fragment-key={fragment.key} data-source-section={fragment.section?.id} className={`cv-fragment ${fragment.section ? `kind-${fragment.section.kind} placement-${fragment.section.placement || 'auto'}` : 'fragment-summary'} role-${fragment.role} ${fragment.entryCard ? 'entry-card' : ''} ${fragment.continued ? 'fragment-continued' : ''} ${fragment.featured ? 'is-featured' : ''} ${isTraining(fragment.section) ? 'section-training' : ''}`}>
      {fragment.section && <div className={`cv-fragment-heading ${suppressed ? 'heading-suppressed' : ''}`}>{renderUnit({ key: `${fragment.section.id}-section${fragment.continued ? '-context' : ''}`, type: 'section', section: fragment.section, continued: fragment.continued }, 0, probe)}</div>}
      <div className="cv-fragment-body">{records.map(record => <div className={record.id === 'summary' ? 'cv-summary-record' : 'cv-record'} data-entry-id={record.id === 'summary' ? undefined : record.id} key={record.id}>{record.units.map((unit, index) => renderUnit(unit, index, probe))}</div>)}</div>
    </section>;
  }
  const qualificationSection = fragments.find(fragment => fragment.phase === 'qualifications' && fragment.section)?.section;
  const probePlans: PagePlan[] = (['first', 'career', 'qualifications', 'qualifications-continued'] as const).map(kind => ({ kind, phase: kind.startsWith('qualifications') ? 'qualifications' : fragments[0]?.phase || 'career', rows: [], secondary: [], chapter: kind === 'qualifications' && ['editorial', 'studio', 'noir'].includes(doc.design.template) ? qualificationSection : undefined }));
  const probes = (splitRole?: 'primary' | 'secondary') => splitRole ? <div className="cv-layout-row row-full"><div className={`cv-slot slot-${splitRole}`} data-probe-slot={splitRole}>{fragments.map(fragment => renderFragment(fragment, true))}</div></div> : <>
    <div className="cv-layout-row row-full"><div className="cv-slot slot-full" data-probe-slot="full">{fragments.map(fragment => renderFragment(fragment, true))}</div></div>
    {doc.design.template === 'lumen' ? (Object.keys(portfolioSlots) as PortfolioLayout[]).map(layout => <div className={`cv-layout-row row-${layout}`} data-layout-probe={layout} key={layout}>{portfolioSlots[layout].map(slot => <div className={`cv-slot slot-${slot}`} data-probe-slot={slot} key={slot}>{fragments.map(fragment => renderFragment(fragment, true))}</div>)}</div>)
      : <div className="cv-layout-row row-pair"><div className="cv-slot slot-left" data-probe-slot="left">{fragments.map(fragment => renderFragment(fragment, true))}</div><div className="cv-slot slot-right" data-probe-slot="right">{fragments.map(fragment => renderFragment(fragment, true))}</div></div>}
  </>;
  useLayoutEffect(() => {
    setMeasured(false);
    let cancelled = false; let timer = 0; let animation = 0;
    const measure = () => {
      const root = measurement.current; if (!root || cancelled) return;
      const frames = new Map(Array.from(root.querySelectorAll<HTMLElement>('.cv-measure-page')).map(frame => [frame.dataset.frameKind as FrameKind, frame]));
      if (frames.size !== 4) return;
      const cache = new Map<string, number>();
      const fragmentByKey = new Map(fragments.map(fragment => [fragment.key, fragment]));
      const capacity = (kind: FrameKind, slot: Slot = 'full', chapter?: CVSection) => {
        const frame = frames.get(kind)!; const rect = frame.getBoundingClientRect();
        const scale = rect.width / 794 || 1;
        const footerTop = frame.querySelector<HTMLElement>('.cv-footer')?.getBoundingClientRect().top ?? rect.top + 1091 * scale;
        const area = frame.querySelector<HTMLElement>(`[data-capacity="${slot === 'primary' || slot === 'secondary' ? slot : 'full'}"]`) || frame.querySelector<HTMLElement>('[data-capacity]')!;
        let adjustment = 0;
        const originalChapter = frame.querySelector<HTMLElement>('.cv-chapter');
        if (chapter && originalChapter && chapter.id !== qualificationSection?.id) {
          const clone = originalChapter.cloneNode(true) as HTMLElement;
          const label = clone.querySelector<HTMLElement>('.section-heading-inner>.editable');
          if (label) label.textContent = chapter.title;
          if (chapter.icon === 'none') clone.querySelector('.cv-printed-icon')?.remove();
          else if (!clone.querySelector('.cv-section-icon')) { const icon = document.createElement('span'); icon.className = 'cv-printed-icon cv-section-icon'; clone.querySelector('.section-heading-inner')?.prepend(icon); }
          originalChapter.after(clone);
          adjustment = (clone.getBoundingClientRect().height - originalChapter.getBoundingClientRect().height) / scale;
          clone.remove();
        }
        return Math.max(120, (footerTop - area.getBoundingClientRect().top) / scale - 18 - adjustment);
      };
      const height = (fragment: Fragment, slot: Slot, kind: FrameKind, chapter?: CVSection) => {
        const frame = frames.get(kind)!;
        const container = frame.querySelector<HTMLElement>(`[data-probe-slot="${slot}"]`) || frame.querySelector<HTMLElement>('[data-probe-slot="full"]')!;
        const base = fragmentByKey.get(fragment.sourceKey || fragment.key);
        if (!base) return 0;
        const key = `${kind}|${slot}|${fragment.key}|${fragment.units[0]?.key}|${fragment.units.at(-1)?.key}|${fragment.continued}|${chapter?.id}`;
        const cached = cache.get(key); if (cached !== undefined) return cached;
        const source = Array.from(container.children).find(element => (element as HTMLElement).dataset.fragmentKey === base.key) as HTMLElement | undefined;
        if (!source) return 0;
        const clone = source.cloneNode(true) as HTMLElement;
        const keys = new Set(fragment.units.map(unit => unit.key));
        clone.querySelectorAll<HTMLElement>('.cv-fragment-body [data-unit-key]').forEach(element => { if (!keys.has(element.dataset.unitKey!)) element.remove(); });
        clone.querySelectorAll<HTMLElement>('.cv-record,.cv-summary-record').forEach(record => { if (!record.querySelector('[data-unit-key]')) record.remove(); });
        clone.classList.toggle('fragment-continued', !!fragment.continued);
        clone.classList.toggle('is-featured', !!fragment.featured);
        const heading = clone.querySelector<HTMLElement>('.cv-fragment-heading');
        heading?.classList.toggle('heading-suppressed', (!!fragment.hideTitle && !fragment.continued) || (chapter?.id === fragment.section?.id && !fragment.continued));
        container.appendChild(clone);
        const slotStyle = getComputedStyle(container);
        const scale = frame.getBoundingClientRect().width / 794 || 1;
        const measuredHeight = clone.getBoundingClientRect().height / scale + (parseFloat(slotStyle.paddingTop) || 0) + (parseFloat(slotStyle.paddingBottom) || 0);
        clone.remove(); cache.set(key, measuredHeight); return measuredHeight;
      };
      const groupHeight = (cells: Fragment[], layout: PortfolioLayout, kind: FrameKind) => {
        const key = `${kind}|group|${layout}|${cells.map(cell => cell.key).join('|')}`;
        const cached = cache.get(key); if (cached !== undefined) return cached;
        const frame = frames.get(kind)!;
        const prototype = frame.querySelector<HTMLElement>(`[data-layout-probe="${layout}"]`);
        const area = frame.querySelector<HTMLElement>('[data-capacity="full"]');
        if (!prototype || !area) return Number.POSITIVE_INFINITY;
        const clone = prototype.cloneNode(true) as HTMLElement;
        const slots = Array.from(clone.querySelectorAll<HTMLElement>('[data-probe-slot]'));
        for (let index = 0; index < slots.length; index += 1) {
          const source = Array.from(slots[index].children).find(element => (element as HTMLElement).dataset.fragmentKey === cells[index]?.key);
          if (!source) return Number.POSITIVE_INFINITY;
          slots[index].replaceChildren(source.cloneNode(true));
        }
        area.appendChild(clone);
        const scale = frame.getBoundingClientRect().width / 794 || 1;
        const measuredHeight = clone.getBoundingClientRect().height / scale;
        clone.remove(); cache.set(key, measuredHeight); return measuredHeight;
      };
      const result = paginateFragments(fragments, doc.design.template, { height, capacity, groupHeight, gap: kind => parseFloat(getComputedStyle(frames.get(kind)!.querySelector('.cv-composition')!).rowGap) || 0 });
      if (!cancelled) { setPages(result); setMeasured(true); onPages(result.length); }
    };
    const schedule = () => { if (cancelled) return; setMeasured(false); window.cancelAnimationFrame(animation); animation = window.requestAnimationFrame(measure); };
    timer = window.setTimeout(schedule, 35);
    void document.fonts.ready.then(() => { if (!cancelled) schedule(); });
    window.addEventListener('cv-image-load', schedule);
    return () => { cancelled = true; window.clearTimeout(timer); window.cancelAnimationFrame(animation); window.removeEventListener('cv-image-load', schedule); };
  }, [fragments, doc.design, doc.name, doc.title, doc.email, doc.phone, doc.address, doc.links, doc.photo, doc.contactIcons, editing, onPages]);
  const frameProps = { doc, onPhoto: props.onPhoto, onProfile: patchProfile, onLink: patchLink, onIcon: props.onIcon, readonly: props.readonly };
  const chapterNode = (section?: CVSection) => section ? renderUnit({ key: `${section.id}-chapter`, type: 'section', section }, 0) : undefined;
  return <>
    <div className="cv-measure-root" ref={measurement} aria-hidden="true" data-editor-only>
      {probePlans.map((plan, index) => <PageFrame key={plan.kind} {...frameProps} plan={plan} pageIndex={index} totalPages={2} editing={editing} measure chapter={chapterNode(plan.chapter)} secondary={probes('secondary')}>{plan.kind === 'first' && doc.design.template === 'summit' ? probes('primary') : probes()}</PageFrame>)}
    </div>
    <div className={`cv-pages ${!measured ? 'is-paginating' : ''}`}>
      {pages.map((page, pageIndex) => <div className="paper-with-label" key={`${doc.design.template}-${pageIndex}`}><div className="paper-label" data-editor-only><span>SEITE {String(pageIndex + 1).padStart(2, '0')}</span><span>A4 · 210 × 297 mm</span></div><PageFrame {...frameProps} plan={page} pageIndex={pageIndex} totalPages={pages.length} editing={editing} chapter={chapterNode(page.chapter)} secondary={page.secondary.map(fragment => renderFragment(fragment))}>{page.rows.map((row, rowIndex) => <div className={`cv-layout-row ${row.layout ? `row-${row.layout}` : row.paired ? 'row-pair' : 'row-full'}`} key={rowIndex}>{row.cells.map((fragment, cellIndex) => <div className={`cv-slot slot-${row.layout ? portfolioSlots[row.layout][cellIndex] : row.paired ? cellIndex === 0 ? 'left' : 'right' : 'full'}`} key={fragment.key}>{renderFragment(fragment, false, page.chapter)}</div>)}</div>)}</PageFrame></div>)}
      {editing && <button className="canvas-add-section" onClick={props.onAddSection} data-editor-only><Plus size={18} /> Abschnitt hinzufügen</button>}
    </div>
  </>;
}
