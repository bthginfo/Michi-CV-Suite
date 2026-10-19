import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Camera, ImagePlus, Mail, MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import type { CVDocument, CVEntry, CVSection } from './model';
import { safeLink } from './model';
import { sectionIcons } from './icons';

type EntryField = 'heading' | 'subheading' | 'period' | 'body';
type ProfileField = 'name' | 'title' | 'email' | 'phone' | 'address';
type Unit = {
  key: string; type: 'summary' | 'section' | 'entry' | 'field' | 'body' | 'image' | 'empty';
  section?: CVSection; entry?: CVEntry; sectionIndex?: number; value?: string;
  field?: EntryField; start?: number; end?: number; line?: number; continued?: boolean;
  keep?: boolean;
};
interface CanvasProps {
  doc: CVDocument; editing: boolean; readonly?: boolean;
  update: (fn: (doc: CVDocument) => CVDocument) => void;
  onPhoto: () => void; onEditEntry: (sectionId: string, entryId?: string) => void;
  onDeleteEntry: (sectionId: string, entryId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, offset: number) => void;
  onMoveEntry: (sectionId: string, entryId: string, offset: number) => void;
  onIcon: (sectionId: string) => void; onAddSection: () => void;
  onPages: (count: number) => void;
}

export function Editable({ value, onChange, editing, className = '', placeholder = '', as = 'span' }: {
  value: string; onChange: (value: string) => void; editing: boolean; className?: string;
  placeholder?: string; as?: 'span' | 'div' | 'h1' | 'p';
}) {
  const element = useRef<HTMLElement>(null);
  const Tag = as;
  useLayoutEffect(() => {
    if (element.current && document.activeElement !== element.current && element.current.innerText !== value) {
      element.current.textContent = value;
    }
  }, [value]);
  return <Tag ref={element as never} className={`editable ${className} ${editing ? 'is-editable' : ''}`}
    contentEditable={editing} suppressContentEditableWarning spellCheck={editing} data-placeholder={placeholder}
    aria-label={editing ? placeholder || 'Text bearbeiten' : undefined}
    onBlur={event => { const next = event.currentTarget.innerText.replace(/\u00a0/g, ' '); if (next !== value) onChange(next); }}
    onPaste={event => {
      if (!editing) return;
      event.preventDefault();
      document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
    }}
  >{value}</Tag>;
}

function textChunks(value: string, size = 250): { value: string; start: number; end: number }[] {
  if (!value) return [];
  const result: { value: string; start: number; end: number }[] = [];
  let start = 0;
  while (start < value.length) {
    let end = Math.min(start + size, value.length);
    if (end < value.length) {
      const space = value.lastIndexOf(' ', end);
      if (space > start + size / 2) end = space + 1;
    }
    result.push({ value: value.slice(start, end), start, end });
    start = end;
  }
  return result;
}

function makeUnits(doc: CVDocument): Unit[] {
  const units: Unit[] = [];
  textChunks(doc.summary, 320).forEach((chunk, index) => units.push({ key: `summary-${index}`, type: 'summary', ...chunk }));
  doc.sections.filter(section => section.visible).forEach((section, sectionIndex) => {
    units.push({ key: `${section.id}-section`, type: 'section', section, sectionIndex, keep: section.entries.length > 0 });
    if (!section.entries.length) units.push({ key: `${section.id}-empty`, type: 'empty', section });
    section.entries.forEach(entry => {
      const headings = textChunks(entry.heading || ' ', 240);
      const subheadings = textChunks(entry.subheading, 270);
      const periods = textChunks(entry.period, 100);
      units.push({ key: `${entry.id}-entry`, type: 'entry', section, entry, value: headings[0]?.value || '', start: 0, end: headings[0]?.end || 0,
        keep: headings.length > 1 || subheadings.length > 0 || !!entry.body || !!entry.image });
      headings.slice(1).forEach((chunk, index) => units.push({ key: `${entry.id}-heading-${index}`, type: 'field', field: 'heading', section, entry, ...chunk, keep: false }));
      periods.slice(1).forEach((chunk, index) => units.push({ key: `${entry.id}-period-${index}`, type: 'field', field: 'period', section, entry, ...chunk }));
      subheadings.forEach((chunk, index) => units.push({ key: `${entry.id}-subheading-${index}`, type: 'field', field: 'subheading', section, entry, ...chunk,
        keep: index === subheadings.length - 1 && (!!entry.body || !!entry.image) }));
      entry.body.split('\n').forEach((line, lineIndex) => {
        if (!line.trim()) return;
        textChunks(line, 320).forEach((chunk, index) => units.push({ key: `${entry.id}-body-${lineIndex}-${index}`, type: 'body', section, entry,
          ...chunk, line: lineIndex, continued: index > 0 }));
      });
      if (entry.image) units.push({ key: `${entry.id}-image`, type: 'image', section, entry });
    });
  });
  return units;
}

function ContactLinks({ doc, small = false, editing = false, onProfile, onLink }: { doc: CVDocument; small?: boolean; editing?: boolean; onProfile: (field: ProfileField, value: string) => void; onLink: (id: string, field: 'label' | 'url', value: string) => void }) {
  return <div className={`cv-contact ${small ? 'cv-contact-small' : ''}`}>
    {(doc.email || editing) && (editing ? <div className="cv-contact-row"><Mail /><Editable value={doc.email} editing placeholder="E-Mail" onChange={value => onProfile('email', value)} /></div> : <a href={`mailto:${doc.email}`}><Mail /><span>{doc.email}</span></a>)}
    {(doc.phone || editing) && (editing ? <div className="cv-contact-row"><Phone /><Editable value={doc.phone} editing placeholder="Telefon" onChange={value => onProfile('phone', value)} /></div> : <a href={`tel:${doc.phone.replace(/[^+\d]/g, '')}`}><Phone /><span>{doc.phone}</span></a>)}
    {(doc.address || editing) && (editing ? <div className="cv-contact-row"><MapPin /><Editable value={doc.address} editing placeholder="Adresse" onChange={value => onProfile('address', value)} /></div> : <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.address)}`} target="_blank" rel="noreferrer"><MapPin /><span>{doc.address}</span></a>)}
    {doc.links.filter(link => editing || safeLink(link.url)).map(link => editing ? <div className="cv-contact-row cv-contact-link-edit" key={link.id}><span className="cv-link-dot">↗</span><Editable value={link.label} editing placeholder="Link-Bezeichnung" onChange={value => onLink(link.id, 'label', value)} /><Editable value={link.url} editing placeholder="https://…" onChange={value => onLink(link.id, 'url', value)} /></div> : <a key={link.id} href={safeLink(link.url)} target="_blank" rel="noreferrer"><span className="cv-link-dot">↗</span><span>{link.label || link.url}</span></a>)}
  </div>;
}

function Portrait({ doc, editing, onPhoto, readonly = false }: { doc: CVDocument; editing: boolean; onPhoto: () => void; readonly?: boolean }) {
  if (!doc.design.showPhoto) return null;
  if (readonly && !doc.photo) return <div className={`cv-photo photo-${doc.design.photoShape} is-empty readonly-photo-spacer`} aria-hidden="true" />;
  const content = doc.photo ? <img src={doc.photo} alt={`Porträt von ${doc.name}`} /> : <div className="cv-photo-empty" data-empty-photo="true">
    <Camera /><span>Dein Foto</span><small>Hier hochladen</small>
  </div>;
  return <div className={`cv-photo photo-${doc.design.photoShape} ${!doc.photo ? 'is-empty' : ''}`}>
    {editing || !doc.photo ? <button type="button" className="cv-photo-button" onClick={onPhoto} title="Profilfoto hochladen" data-editor-only={!doc.photo ? 'true' : undefined}>{content}
      {doc.photo && <span className="photo-change" data-editor-only><Camera size={15} /> Foto ändern</span>}
    </button> : content}
  </div>;
}

function PageFrame({ doc, first, pageIndex, totalPages, editing, onPhoto, onProfile, onLink, children, measure = false, readonly = false }: {
  doc: CVDocument; first: boolean; pageIndex: number; totalPages: number; editing: boolean; onPhoto: () => void;
  onProfile: (field: ProfileField, value: string) => void; onLink: (id: string, field: 'label' | 'url', value: string) => void; children: ReactNode; measure?: boolean; readonly?: boolean;
}) {
  const template = doc.design.template;
  const sideRail = template === 'editorial' || template === 'executive';
  return <article className={`${measure ? 'cv-measure-page' : 'cv-page'} template-${template} density-${doc.design.density} font-${doc.design.font} ${first ? 'is-first' : 'is-continuation'} ${editing ? 'canvas-editing' : ''}`}
    style={{ '--cv-accent': doc.design.color } as CSSProperties} aria-label={measure ? undefined : `Lebenslauf, Seite ${pageIndex + 1} von ${totalPages}`}>
    {sideRail && <aside className="cv-side-rail">
      {first ? <><div className="rail-eyebrow">CURRICULUM VITAE</div><Portrait doc={doc} editing={editing} onPhoto={onPhoto} readonly={readonly} /><div className="rail-title">Kontakt</div><ContactLinks doc={doc} editing={editing} onProfile={onProfile} onLink={onLink} /><div className="rail-bottom"><span>{doc.name}</span></div></> : <><div className="rail-eyebrow">CURRICULUM VITAE</div><div className="rail-continuation-name">{doc.name}</div><div className="rail-page">{String(pageIndex + 1).padStart(2, '0')}</div></>}
    </aside>}
    <div className="cv-page-inner">
      <header className={`cv-header ${!first ? 'cv-continuation-header' : ''}`}>
        {first ? <>
          <div className="cv-header-copy">
            <div className="cv-eyebrow">{template === 'mono' ? '// CURRICULUM VITAE' : 'CURRICULUM VITAE'}</div>
            <Editable as="h1" className="cv-name" value={doc.name} editing={editing} placeholder="Dein Name" onChange={value => onProfile('name', value)} />
            <Editable as="div" className="cv-role" value={doc.title} editing={editing} placeholder="Berufsbezeichnung" onChange={value => onProfile('title', value)} />
            {!sideRail && <ContactLinks doc={doc} small editing={editing} onProfile={onProfile} onLink={onLink} />}
          </div>
          {!sideRail && <Portrait doc={doc} editing={editing} onPhoto={onPhoto} readonly={readonly} />}
        </> : <><span>{doc.name}</span><span>{template === 'mono' ? '// ' : ''}Lebenslauf · Fortsetzung</span></>}
      </header>
      <div className="cv-content">{children}</div>
    </div>
    <footer className="cv-footer"><span>{doc.name}</span><span>{template === 'mono' ? '[' : ''}{String(pageIndex + 1).padStart(2, '0')}<span className="footer-slash"> / </span>{String(totalPages).padStart(2, '0')}{template === 'mono' ? ']' : ''}</span></footer>
  </article>;
}

export default function CVCanvas(props: CanvasProps) {
  const { doc, editing, update, onPages } = props;
  const units = useMemo(() => makeUnits(doc), [doc]);
  const measurement = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<Unit[][]>([units]);
  const [measured, setMeasured] = useState(false);

  const patchEntry = (sectionId: string, entryId: string, field: EntryField, value: string, start?: number, end?: number, line?: number) => {
    update(current => ({ ...current, sections: current.sections.map(section => section.id !== sectionId ? section : {
      ...section, entries: section.entries.map(entry => {
        if (entry.id !== entryId) return entry;
        let next = value;
        if (field === 'body' && line !== undefined) {
          const lines = entry.body.split('\n');
          const original = lines[line] || '';
          lines[line] = start !== undefined ? original.slice(0, start) + value + original.slice(end) : value;
          next = lines.join('\n');
        } else if (start !== undefined) next = entry[field].slice(0, start) + value + entry[field].slice(end);
        return { ...entry, [field]: next };
      }),
    }) }));
  };
  const patchProfile = (field: ProfileField, value: string) => update(current => ({ ...current, [field]: value }));
  const patchLink = (id: string, field: 'label' | 'url', value: string) => update(current => ({ ...current, links: current.links.map(link => link.id === id ? { ...link, [field]: value } : link) }));

  function renderUnit(unit: Unit, index: number, isMeasure = false) {
    const { section, entry } = unit;
    const edit = editing && !isMeasure;
    if (unit.type === 'summary') return <div className="cv-unit cv-summary" key={unit.key} data-unit-index={isMeasure ? index : undefined}>
      <Editable as="p" value={unit.value || ''} editing={edit} placeholder="Dein Profil" onChange={value => update(current => ({ ...current, summary: current.summary.slice(0, unit.start) + value + current.summary.slice(unit.end) }))} />
    </div>;
    if (!section) return null;
    const SectionIcon = sectionIcons[section.icon];
    if (unit.type === 'section') return <div className={`cv-unit cv-section-heading ${unit.continued ? 'section-continued' : ''}`} key={unit.key} data-unit-index={isMeasure ? index : undefined}>
      <div className="section-heading-inner">
        <span className="cv-section-number">{String((unit.sectionIndex || 0) + 1).padStart(2, '0')}</span>
        <button className="cv-section-icon" type="button" onClick={() => edit && props.onIcon(section.id)} disabled={!edit} title={edit ? 'Symbol ändern' : undefined} tabIndex={edit ? 0 : -1}><SectionIcon size={16} /></button>
        <Editable value={section.title} editing={edit} placeholder="Abschnittstitel" onChange={value => update(current => ({ ...current, sections: current.sections.map(item => item.id === section.id ? { ...item, title: value } : item) }))} />
        {unit.continued && <span className="cv-cont-label">Fortsetzung</span>}
        <span className="cv-section-rule" />
      </div>
      {edit && !unit.continued && <div className="canvas-section-actions" data-editor-only>
        <button onClick={() => props.onMoveSection(section.id, -1)} title="Abschnitt nach oben" aria-label="Abschnitt nach oben"><ArrowUp size={13} /></button>
        <button onClick={() => props.onMoveSection(section.id, 1)} title="Abschnitt nach unten" aria-label="Abschnitt nach unten"><ArrowDown size={13} /></button>
        <button onClick={() => props.onEditEntry(section.id)} title="Eintrag hinzufügen" aria-label="Eintrag hinzufügen"><Plus size={13} /></button>
        <button onClick={() => props.onDeleteSection(section.id)} title="Abschnitt löschen" aria-label="Abschnitt löschen"><Trash2 size={13} /></button>
      </div>}
    </div>;
    if (unit.type === 'empty') return <div className="cv-unit cv-empty-section" key={unit.key} data-unit-index={isMeasure ? index : undefined}>
      {edit && <button onClick={() => props.onEditEntry(section.id)} data-editor-only><Plus size={13} /> Ersten Eintrag hinzufügen</button>}
    </div>;
    if (!entry) return null;
    if (unit.type === 'entry') return <div className={`cv-unit cv-entry-header kind-${section.kind}`} key={unit.key} data-unit-index={isMeasure ? index : undefined}>
      <Editable className="cv-period" value={textChunks(entry.period, 100)[0]?.value || ''} editing={edit} placeholder="Zeitraum" onChange={value => patchEntry(section.id, entry.id, 'period', value, 0, textChunks(entry.period, 100)[0]?.end || 0)} />
      <Editable className="cv-entry-heading" value={unit.value?.trim() || ''} editing={edit} placeholder="Titel oder Unternehmen" onChange={value => patchEntry(section.id, entry.id, 'heading', value, unit.start, unit.end)} />
      {edit && <div className="canvas-entry-actions" data-editor-only>
        <button title="Eintrag bearbeiten" aria-label="Eintrag bearbeiten" onClick={() => props.onEditEntry(section.id, entry.id)}><Pencil size={12} /></button>
        <button title="Eintrag nach oben" aria-label="Eintrag nach oben" onClick={() => props.onMoveEntry(section.id, entry.id, -1)}><ArrowUp size={12} /></button>
        <button title="Eintrag nach unten" aria-label="Eintrag nach unten" onClick={() => props.onMoveEntry(section.id, entry.id, 1)}><ArrowDown size={12} /></button>
        <button title="Eintrag löschen" aria-label="Eintrag löschen" onClick={() => props.onDeleteEntry(section.id, entry.id)}><Trash2 size={12} /></button>
      </div>}
    </div>;
    if (unit.type === 'field') return <div className={`cv-unit cv-entry-field field-${unit.field} kind-${section.kind}`} key={unit.key} data-unit-index={isMeasure ? index : undefined}>
      <Editable value={unit.value || ''} editing={edit} placeholder={unit.field === 'subheading' ? 'Position oder Abschluss' : 'Text bearbeiten'} onChange={value => patchEntry(section.id, entry.id, unit.field!, value, unit.start, unit.end)} />
    </div>;
    if (unit.type === 'image') return <div className="cv-unit cv-entry-image" key={unit.key} data-unit-index={isMeasure ? index : undefined}>
      <img src={entry.image} alt={`Bild zu ${entry.heading}`} onLoad={() => window.dispatchEvent(new Event('cv-image-load'))} />
      {edit && <button data-editor-only title="Bild ersetzen" onClick={() => props.onEditEntry(section.id, entry.id)}><ImagePlus size={14} /></button>}
    </div>;
    return <div className={`cv-unit cv-body-line kind-${section.kind} ${unit.continued ? 'line-continuation' : ''}`} key={unit.key} data-unit-index={isMeasure ? index : undefined}>
      {section.kind === 'experience' && !unit.continued && <span className="cv-bullet" />}
      <Editable value={unit.value || ''} editing={edit} placeholder="Beschreibung" onChange={value => patchEntry(section.id, entry.id, 'body', value, unit.start, unit.end, unit.line)} />
    </div>;
  }

  useLayoutEffect(() => {
    let cancelled = false;
    let timer = 0;
    const measure = () => {
      const root = measurement.current;
      if (!root || cancelled) return;
      const frames = root.querySelectorAll<HTMLElement>('.cv-measure-page');
      if (frames.length < 2) return;
      const capacity = Array.from(frames).map(frame => {
        const content = frame.querySelector<HTMLElement>('.cv-content')!;
        const footer = frame.querySelector<HTMLElement>('.cv-footer')!;
        const scale = frame.getBoundingClientRect().width / 794 || 1;
        return Math.max(200, (footer.getBoundingClientRect().top - content.getBoundingClientRect().top) / scale - 22);
      });
      const heightMap = new Map<number, number>();
      const scale = frames[0].getBoundingClientRect().width / 794 || 1;
      frames[0].querySelectorAll<HTMLElement>('[data-unit-index]').forEach(element => heightMap.set(Number(element.dataset.unitIndex), element.getBoundingClientRect().height / scale));
      const result: Unit[][] = [];
      let page: Unit[] = [];
      let used = 0;
      let limit = capacity[0];
      const flush = () => { if (page.length) result.push(page); page = []; used = 0; limit = capacity[1]; };
      for (let index = 0; index < units.length; index++) {
        const unit = units[index];
        const height = heightMap.get(index) || 0;
        let required = height;
        let cursor = index;
        while (units[cursor]?.keep && units[cursor + 1]) { cursor += 1; required += heightMap.get(cursor) || 0; }
        if (required > limit) required = height;
        if (used + required > limit && page.length) flush();
        if (!page.length && result.length && unit.type !== 'section' && unit.section) {
          const originalIndex = units.findIndex(item => item.type === 'section' && item.section?.id === unit.section?.id);
          const original = units[originalIndex];
          const continuation = { ...original, key: `${unit.key}-continuation`, continued: true, keep: false };
          const headingHeight = heightMap.get(originalIndex) || 42;
          page.push(continuation);
          used += headingHeight;
        }
        page.push(unit);
        used += height;
      }
      flush();
      if (!result.length) result.push([]);
      setPages(result);
      setMeasured(true);
      onPages(result.length);
    };
    timer = window.setTimeout(measure, 30);
    void document.fonts.ready.then(() => { if (!cancelled) measure(); });
    window.addEventListener('cv-image-load', measure);
    return () => { cancelled = true; window.clearTimeout(timer); window.removeEventListener('cv-image-load', measure); };
  }, [units, doc.design, doc.name, doc.title, doc.email, doc.phone, doc.address, doc.links, doc.photo, props.readonly, editing, onPages]);

  useEffect(() => { setMeasured(false); }, [doc.design.template, doc.design.font, doc.design.density]);

  return <>
    <div className="cv-measure-root" ref={measurement} aria-hidden="true" data-editor-only>
      <PageFrame doc={doc} first pageIndex={0} totalPages={1} editing={editing} onPhoto={() => {}} onProfile={() => {}} onLink={() => {}} readonly={props.readonly} measure>{units.map((unit, index) => renderUnit(unit, index, true))}</PageFrame>
      <PageFrame doc={doc} first={false} pageIndex={1} totalPages={2} editing={editing} onPhoto={() => {}} onProfile={() => {}} onLink={() => {}} readonly={props.readonly} measure>{null}</PageFrame>
    </div>
    <div className={`cv-pages ${!measured ? 'is-paginating' : ''}`}>
      {pages.map((page, pageIndex) => <div className="paper-with-label" key={`${doc.design.template}-${pageIndex}`}>
        <div className="paper-label" data-editor-only><span>SEITE {String(pageIndex + 1).padStart(2, '0')}</span><span>A4 · 210 × 297 mm</span></div>
        <PageFrame doc={doc} first={pageIndex === 0} pageIndex={pageIndex} totalPages={pages.length} editing={editing} onPhoto={props.onPhoto} onProfile={patchProfile} onLink={patchLink} readonly={props.readonly}>{page.map((unit, index) => renderUnit(unit, index))}</PageFrame>
      </div>)}
      {editing && <button className="canvas-add-section" onClick={props.onAddSection} data-editor-only><Plus size={18} /> Abschnitt hinzufügen</button>}
    </div>
  </>;
}
