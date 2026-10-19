import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUp, Camera, Check, ChevronDown, ChevronRight, Cloud, CloudCheck,
  CloudOff, Copy, Download, ExternalLink, Eye, EyeOff, FileDown, FileText, Image, ImagePlus,
  Keyboard, Layers, Link, LoaderCircle, LockKeyhole, LogOut, Mail, Maximize2, Menu, MoreHorizontal,
  Paintbrush, Pencil, Phone, Plus, Redo2, RotateCcw, Settings2, Share2, ShieldCheck, Sparkles,
  Trash2, Type, Undo2, Upload, X, ZoomIn, ZoomOut, type LucideIcon,
} from 'lucide-react';
import { useWorkspace } from './useWorkspace';
import { downloadBackup, exportPDF, importBackup, prepareImage } from './export';
import { iconNames, newId, safeLink, type CVDocument, type CVEntry, type CVSection, type IconName } from './model';
import { defaultTargetIcon, iconCategories, iconCategory, iconLabels, matchesIcon, sectionIcons, targetIcon, withTargetIcon, type IconCategory, type IconTarget } from './icons';
import CVCanvas from './CVCanvas';
import { layoutSpecs } from './layout';
import Onboarding, { TOUR_KEY } from './Onboarding';
import ContentAssistant from './ContentAssistant';
import { contentModules, moduleIsPresent } from './contentModules';
import './styles.css';
import './templates/base.css';
import './templates/orbit.css';
import './templates/folio.css';
import './templates/signal.css';
import './templates/vector.css';
import './templates/grid.css';
import './templates/haven.css';
import './templates/copper.css';
import './templates/noir.css';
import './templates/lumen.css';
import './templates/summit.css';
import './templates/modules.css';
import './customization.css';

type Pane = 'design' | 'content' | 'photo' | 'settings';
type Toast = { message: string; error?: boolean } | null;
const templateOptions = (['nordic', 'mono', 'editorial', 'executive', 'studio', 'haven', 'copper', 'noir', 'lumen', 'summit'] as const).map(id => ({ id, ...layoutSpecs[id] }));
const colors = ['#1e6b68', '#3159d8', '#6155a6', '#8c4149', '#a07a36', '#334155', '#41745f'];
const paneMeta: Record<Pane, { icon: LucideIcon; name: string; title: string; description: string }> = {
  design: { icon: Paintbrush, name: 'Design', title: 'Dein Stil. Dein CV.', description: 'Der erste Eindruck gehört dir.' },
  content: { icon: FileText, name: 'Inhalte', title: 'Deine Geschichte.', description: 'Alles, was dich ausmacht.' },
  photo: { icon: Image, name: 'Foto', title: 'Zeig Persönlichkeit.', description: 'Ein Foto macht den Unterschied.' },
  settings: { icon: Settings2, name: 'Mehr', title: 'Dein Studio.', description: 'Ein CV. Auf allen Geräten.' },
};

function IconButton({ icon: Icon, label, onClick, disabled, className = '' }: {
  icon: LucideIcon; label: string; onClick: () => void; disabled?: boolean; className?: string;
}) { return <button type="button" className={`icon-button ${className}`} title={label} aria-label={label} onClick={onClick} disabled={disabled}><Icon size={17} strokeWidth={1.65} /></button>; }

function Modal({ title, eyebrow, onClose, children, className = '' }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => (root.current?.querySelector<HTMLElement>('.icon-search input') ?? root.current?.querySelector<HTMLElement>('input, textarea, select, button'))?.focus(), 50);
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key !== 'Tab') return;
      const elements = root.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select, textarea, [tabindex="0"]');
      if (!elements?.length) return;
      const first = elements[0]; const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', keyboard);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', keyboard); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title} ref={root}>
      <header className="modal-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div><IconButton icon={X} label="Dialog schließen" onClick={onClose} /></header>
      {children}
    </div>
  </div>;
}

function IconChoices({ selected, onSelect, compact = false }: { selected: IconName; onSelect: (name: IconName) => void; compact?: boolean }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<IconCategory>('Alle');
  const results = iconNames.filter(name => name !== 'none' && (category === 'Alle' || iconCategory(name) === category) && matchesIcon(name, query));
  return <div className={`icon-library ${compact ? 'is-compact' : ''}`}>
    <label className="icon-search"><span className="visually-hidden">Symbole suchen</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Symbol suchen, z. B. Fahrzeug, Team, Foto …" /></label>
    <div className="icon-categories" aria-label="Symbolkategorien">{iconCategories.map(item => <button type="button" className={category === item ? 'selected' : ''} aria-pressed={category === item} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <button type="button" className={`icon-remove-option ${selected === 'none' ? 'selected' : ''}`} onClick={() => onSelect('none')} aria-pressed={selected === 'none'}><Trash2 size={16} /><span>Kein Symbol<small>Aus dem Lebenslauf entfernen</small></span>{selected === 'none' && <Check size={16} />}</button>
    <div className="icon-library-grid" aria-label="Symbole">{results.map(name => { const Icon = sectionIcons[name]; return <button type="button" key={name} className={selected === name ? 'selected' : ''} onClick={() => onSelect(name)} aria-label={iconLabels[name]} aria-pressed={selected === name} title={iconLabels[name]}><Icon size={21} strokeWidth={1.6} /><span>{name === 'code' ? 'Code' : iconLabels[name]}</span></button>; })}</div>
    {!results.length && <p className="icon-empty">Kein Symbol gefunden. Versuche einen anderen Begriff oder eine andere Kategorie.</p>}
    <p className="icon-library-note">{results.length} Symbole · Lucide · Einheitliche Linien, klare Details</p>
  </div>;
}

function TemplateThumbnail({ template, selected, doc, onClick }: { template: typeof templateOptions[number]; selected: boolean; doc: CVDocument; onClick: () => void }) {
  return <button className={`template-option ${selected ? 'is-selected' : ''}`} onClick={onClick} aria-pressed={selected} title={`${template.name} – ${template.description}`}>
    <div className={`template-mini mini-page mini-${template.id} mini-first`} style={{ '--mini-accent': selected ? doc.design.color : template.color } as CSSProperties} aria-hidden="true">
      <div className="mini-identity"><div className="mini-name">{doc.name}</div><div className="mini-role" /><div className="mini-photo" /><div className="mini-contact-lines" /></div>
      <div className="mini-composition">{Array.from({ length: 4 }, (_, index) => <div className={`mini-panel mini-panel-${['a', 'b', 'c', 'd'][index]}`} key={index}><span className="mini-panel-title" />{Array.from({ length: [5, 4, 3, 4][index] }, (_, line) => <i key={line} />)}</div>)}</div>
    </div>
    {selected && <span className="template-check"><Check size={11} strokeWidth={2.6} /></span>}
    <span className="template-option-name">{template.name}<span>{template.category}</span></span>
  </button>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? 'is-on' : ''}`} onClick={onChange}><span /></button>;
}

function Field({ label, value, onChange, textarea = false, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; placeholder?: string; type?: string }) {
  return <label className="field"><span>{label}</span>{textarea ? <textarea value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} rows={4} /> : <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} type={type} />}</label>;
}

function ShareDialog({ share, name, onClose, notify }: { share: () => Promise<string>; name: string; onClose: () => void; notify: (message: string, error?: boolean) => void }) {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const shareRef = useRef(share); shareRef.current = share;
  useEffect(() => {
    let active = true; setError(''); setLoading(true);
    void shareRef.current().then(value => { if (active) { setLink(value); setLoading(false); } }).catch((cause: unknown) => { if (active) { setError(cause instanceof Error ? cause.message : 'Der Link konnte nicht erstellt werden.'); setLoading(false); } });
    return () => { active = false; };
  }, [attempt]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); notify('Link in die Zwischenablage kopiert.'); }
    catch { input.current?.select(); notify('Link markiert – mit Strg/Cmd + C kopieren.'); }
  };
  return <Modal title="Dein Lebenslauf. Ein schöner Link." eyebrow="LESEANSICHT TEILEN" onClose={onClose} className="share-modal">
    <div className="share-illustration"><div className="share-paper"><span>{name.split(' ')[0]}<br /><b>{name.split(' ').slice(1).join(' ')}</b></span><i /><i /><i /></div><div className="share-badge"><Link size={23} /></div></div>
    <h3>Bereit für neue Möglichkeiten.</h3><p className="modal-description">Teile eine feste Momentaufnahme mit klickbaren Kontaktdaten und PDF-Download. Die Empfänger können deinen Lebenslauf lesen, aber nicht bearbeiten.</p>
    {loading ? <div className="share-link-loading"><LoaderCircle size={18} className="spin" /> Leseansicht wird erstellt …</div> : error ? <div className="inline-error"><p>{error}</p><button className="button secondary" onClick={() => setAttempt(value => value + 1)}>Erneut versuchen</button></div> : <div className="share-link-field"><input ref={input} readOnly value={link} aria-label="Öffentlicher Leselink" onFocus={event => event.target.select()} /><button className="button primary" onClick={() => void copy()}><Copy size={16} /> Kopieren</button></div>}
    {!!link && !loading && <a className="text-link share-open-link" href={link} target="_blank" rel="noreferrer">Leseansicht öffnen <ExternalLink size={13} /></a>}
    <div className="modal-bottom-note"><ShieldCheck size={14} /> Spätere Änderungen an deinem CV verändern diesen Link nicht.</div>
  </Modal>;
}

function EntryDialog({ section, entry, onSave, onClose, notify }: { section: CVSection; entry?: CVEntry; onSave: (entry: CVEntry) => void; onClose: () => void; notify: (message: string, error?: boolean) => void }) {
  const [draft, setDraft] = useState<CVEntry>(() => entry ? { ...entry } : { id: newId(), heading: '', subheading: '', period: '', body: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const photo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const image = await prepareImage(file); setDraft(current => ({ ...current, image })); }
    catch (error) { notify(error instanceof Error ? error.message : 'Das Bild konnte nicht geladen werden.', true); }
    finally { setUploading(false); event.target.value = ''; }
  };
  return <Modal title={entry ? 'Eintrag bearbeiten' : 'Ein neuer Teil deiner Geschichte.'} eyebrow={section.title} onClose={onClose}>
    <form onSubmit={event => { event.preventDefault(); if (draft.heading.trim() || draft.subheading.trim() || draft.period.trim() || draft.body.trim() || draft.image) onSave(draft); }} className="entry-form">
      <Field label={section.kind === 'experience' ? 'Unternehmen / Organisation' : 'Titel / Institution'} value={draft.heading} onChange={heading => setDraft(current => ({ ...current, heading }))} placeholder="z. B. Unternehmen GmbH" />
      <Field label={section.kind === 'education' ? 'Abschluss / Qualifikation' : 'Position / Untertitel'} value={draft.subheading} onChange={subheading => setDraft(current => ({ ...current, subheading }))} placeholder="Was war deine Rolle?" />
      <Field label="Zeitraum" value={draft.period} onChange={period => setDraft(current => ({ ...current, period }))} placeholder="z. B. 01/2024 – heute" />
      <Field label={section.kind === 'experience' ? 'Aufgaben & Erfolge · ein Punkt pro Zeile' : 'Beschreibung · ein Gedanke pro Zeile'} value={draft.body} onChange={body => setDraft(current => ({ ...current, body }))} textarea placeholder="Was möchtest du dazu erzählen?" />
      <input type="file" accept="image/jpeg,image/png,image/webp" ref={imageInput} className="visually-hidden" onChange={event => void photo(event)} aria-label="Bild zum Eintrag hochladen" />
      {draft.image ? <div className="entry-image-preview"><img src={draft.image} alt="Bildvorschau zum Eintrag" /><button type="button" className="icon-button" title="Bild entfernen" aria-label="Bild entfernen" onClick={() => setDraft(current => ({ ...current, image: '' }))}><X size={16} /></button></div> : null}
      <button type="button" className="button secondary image-entry-button" disabled={uploading} onClick={() => imageInput.current?.click()}>{uploading ? <LoaderCircle size={15} className="spin" /> : <ImagePlus size={15} />}{draft.image ? 'Bild ersetzen' : 'Bild hinzufügen'}<span>optional</span></button>
      <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Abbrechen</button><button type="submit" className="button primary" disabled={!(draft.heading.trim() || draft.subheading.trim() || draft.period.trim() || draft.body.trim() || draft.image) || uploading}><Check size={16} /> {entry ? 'Änderungen übernehmen' : 'Eintrag hinzufügen'}</button></div>
    </form>
  </Modal>;
}

function SectionDialog({ onSave, onClose }: { onSave: (section: CVSection) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<CVSection['kind']>('custom');
  const [icon, setIcon] = useState<IconName>('layers');
  return <Modal title="Platz für das, was dich ausmacht." eyebrow="NEUER ABSCHNITT" onClose={onClose}>
    <form onSubmit={event => { event.preventDefault(); if (title.trim()) onSave({ id: newId(), title: title.trim(), kind, icon, visible: true, entries: [] }); }} className="entry-form">
      <Field label="Abschnittstitel" value={title} onChange={setTitle} placeholder="z. B. Projekte, Ehrenamt oder Auszeichnungen" />
      <label className="field"><span>Inhaltstyp</span><select value={kind} onChange={event => setKind(event.target.value as CVSection['kind'])}><option value="custom">Eigener Abschnitt</option><option value="experience">Berufserfahrung · mit Aufzählungen</option><option value="education">Ausbildung & Weiterbildung</option><option value="skills">Kenntnisse & Interessen</option></select></label>
      <span className="field-label">Symbol</span><IconChoices selected={icon} onSelect={setIcon} compact />
      <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Abbrechen</button><button type="submit" className="button primary" disabled={!title.trim()}><Plus size={16} /> Abschnitt hinzufügen</button></div>
    </form>
  </Modal>;
}

function Status({ status, error, small = false }: { status: string; error: string | null; small?: boolean }) {
  const isBusy = status === 'saving' || status === 'loading';
  const isError = status === 'error' || status === 'offline';
  const Icon = isBusy ? LoaderCircle : isError ? CloudOff : CloudCheck;
  return <div className={`save-status ${isError ? 'save-error' : ''} ${small ? 'small' : ''}`} title={error || (status === 'saved' ? 'Alle Änderungen sind in der Cloud gespeichert.' : 'Deine Änderungen werden gesichert.')}><Icon size={small ? 13 : 15} className={isBusy ? 'spin' : ''} /><span>{status === 'loading' ? 'CV wird geladen' : status === 'saving' ? 'Wird gespeichert …' : status === 'offline' ? 'Lokal gespeichert' : status === 'error' ? 'Synchronisierung prüfen' : 'Alle Änderungen gespeichert'}</span></div>;
}

export default function App() {
  const workspace = useWorkspace();
  const { doc, update, undo, redo, canUndo, canRedo, status, error, ready, isReadonly, share, reset, replace, retry } = workspace;
  const [pane, setPane] = useState<Pane>('design');
  const [paneOpen, setPaneOpen] = useState(() => window.innerWidth >= 750);
  const [editing, setEditing] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [zoom, setZoom] = useState(0.7);
  const [fit, setFit] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [entryEditor, setEntryEditor] = useState<{ sectionId: string; entryId?: string } | null>(null);
  const [sectionDialog, setSectionDialog] = useState(false);
  const [iconTarget, setIconTarget] = useState<IconTarget | null>(null);
  const [confirmation, setConfirmation] = useState<{ title: string; description: string; action: string; run: () => void } | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['profile']);
  const [help, setHelp] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const tourInitialized = useRef(false);
  const viewport = useRef<HTMLDivElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);
  const toastTimer = useRef(0);
  const calculateZoom = useCallback(() => {
    const width = viewport.current?.clientWidth || 0;
    if (width < 100) return;
    setZoom(Math.max(0.2, Math.min(isReadonly ? 0.86 : 0.78, (width - (width < 650 ? 24 : 110)) / 794)));
  }, [isReadonly]);
  const notify = useCallback((message: string, isError = false) => {
    window.clearTimeout(toastTimer.current); setToast({ message, error: isError });
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  }, []);
  const onPages = useCallback((count: number) => setPageCount(count), []);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable="true"]')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isReadonly) { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [undo, redo, isReadonly]);
  useEffect(() => {
    if (!ready || !viewport.current || !fit) return;
    const element = viewport.current;
    calculateZoom();
    const observer = new ResizeObserver(calculateZoom); observer.observe(element);
    return () => observer.disconnect();
  }, [fit, paneOpen, ready, calculateZoom]);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);
  useEffect(() => {
    const flushEditable = () => {
      const active = document.activeElement;
      if (active instanceof HTMLElement && active.isContentEditable) active.blur();
    };
    const visibility = () => { if (document.visibilityState === 'hidden') flushEditable(); };
    window.addEventListener('pagehide', flushEditable, true);
    window.addEventListener('beforeunload', flushEditable, true);
    window.addEventListener('blur', flushEditable, true);
    document.addEventListener('visibilitychange', visibility, true);
    return () => { window.removeEventListener('pagehide', flushEditable, true); window.removeEventListener('beforeunload', flushEditable, true); window.removeEventListener('blur', flushEditable, true); document.removeEventListener('visibilitychange', visibility, true); };
  }, []);
  useEffect(() => {
    if (!ready || isReadonly || tourInitialized.current) return;
    let completed = false;
    try { completed = localStorage.getItem(TOUR_KEY) === 'done'; } catch { /* The tour remains skippable without storage. */ }
    if (completed) { tourInitialized.current = true; return; }
    const timer = window.setTimeout(() => { tourInitialized.current = true; setTourOpen(true); }, 650);
    return () => window.clearTimeout(timer);
  }, [ready, isReadonly]);
  const prepareTour = useCallback((next: Pane | undefined, sidebar: boolean) => {
    if (next) setPane(next);
    setPaneOpen(sidebar);
  }, []);
  useEffect(() => { document.querySelector<HTMLElement>('.context-pane .pane-scroll')?.scrollTo({ top: 0, behavior: 'instant' }); }, [pane]);

  const design = (patch: Partial<CVDocument['design']>) => update(current => ({ ...current, design: { ...current.design, ...patch } }));
  const selectTemplate = (template: typeof templateOptions[number]) => {
    design({ template: template.id, color: template.color });
    viewport.current?.querySelector<HTMLElement>('.canvas-scroll')?.scrollTo({ top: 0, left: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    notify(`${template.name} – dein neuer Look.`);
  };
  const profile = (field: 'name' | 'title' | 'email' | 'phone' | 'address' | 'summary', value: string) => update(current => ({ ...current, [field]: value }));
  const toggleSection = (id: string) => setOpenSections(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const reorderSection = (id: string, offset: number) => update(current => {
    const list = [...current.sections]; const index = list.findIndex(item => item.id === id); const next = index + offset;
    if (next < 0 || next >= list.length) return current;
    [list[index], list[next]] = [list[next], list[index]];
    return { ...current, sections: list };
  });
  const reorderEntry = (sectionId: string, entryId: string, offset: number) => update(current => ({ ...current, sections: current.sections.map(section => {
    if (section.id !== sectionId) return section;
    const entries = [...section.entries]; const index = entries.findIndex(item => item.id === entryId); const next = index + offset;
    if (next < 0 || next >= entries.length) return section;
    [entries[index], entries[next]] = [entries[next], entries[index]];
    return { ...section, entries };
  }) }));
  const deleteSection = (id: string) => {
    const section = doc.sections.find(item => item.id === id);
    setConfirmation({ title: 'Abschnitt entfernen?', description: `„${section?.title}“ und die zugehörigen Einträge werden entfernt. Du kannst den Schritt mit Rückgängig wiederherstellen.`, action: 'Abschnitt entfernen', run: () => { update(current => ({ ...current, sections: current.sections.filter(item => item.id !== id) })); notify('Abschnitt entfernt. Mit Rückgängig wiederherstellbar.'); } });
  };
  const deleteEntry = (sectionId: string, entryId: string) => { update(current => ({ ...current, sections: current.sections.map(section => section.id !== sectionId ? section : { ...section, entries: section.entries.filter(item => item.id !== entryId) }) })); notify('Eintrag entfernt. Mit Rückgängig wiederherstellbar.'); };
  const uploadPhoto = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try { const image = await prepareImage(file); update(current => ({ ...current, photo: image, design: { ...current.design, showPhoto: true } })); notify('Dein Foto ist jetzt Teil deines CVs.'); }
    catch (cause) { notify(cause instanceof Error ? cause.message : 'Das Foto konnte nicht hochgeladen werden.', true); }
    finally { setUploading(false); }
  };
  const pdf = async () => {
    (document.activeElement as HTMLElement | null)?.blur();
    setEditing(false);
    setExporting(true);
    try {
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const started = performance.now();
      while (document.querySelector('.cv-pages.is-paginating, .cv-page.canvas-editing')) {
        if (performance.now() - started > 8000) throw new Error('Die Vorschau wird noch aufgebaut. Bitte kurz warten und erneut versuchen.');
        await new Promise(resolve => window.setTimeout(resolve, 30));
      }
      await exportPDF(doc); notify('Dein PDF ist bereit. Viel Erfolg damit!');
    }
    catch (cause) { notify(cause instanceof Error ? cause.message : 'Der PDF-Export ist fehlgeschlagen.', true); }
    finally { setExporting(false); }
  };
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { const imported = await importBackup(file); setConfirmation({ title: 'Sicherung wiederherstellen?', description: `Der aktuelle CV wird durch die Sicherung von „${imported.name}“ ersetzt.`, action: 'Sicherung laden', run: () => { replace(imported); notify('Deine Sicherung wurde wiederhergestellt.'); } }); }
    catch (cause) { notify(cause instanceof Error ? cause.message : 'Die Datei konnte nicht eingelesen werden.', true); }
    finally { event.target.value = ''; }
  };
  const switchPane = (next: Pane) => { if (pane === next) setPaneOpen(value => !value); else { setPane(next); setPaneOpen(true); } };
  const activeEntrySection = entryEditor ? doc.sections.find(section => section.id === entryEditor.sectionId) : undefined;

  if (!ready) return <div className="app-loading"><div className="loading-brand"><Brand /><span>Dein nächster Schritt beginnt hier.</span></div><div className="loading-layout"><div className="loading-sidebar"><i /><i /><i /></div><div className="loading-paper"><LoaderCircle size={24} className="spin" /><span>Dein CV wird geladen …</span></div></div></div>;
  if (isReadonly && error) return <main className="not-found"><Brand /><div className="not-found-art"><FileText size={42} /><span>?</span></div><p className="eyebrow">LESEANSICHT</p><h1>Dieser CV ist gerade<br />nicht erreichbar.</h1><p>{error}</p><button className="button primary" onClick={retry}>Erneut versuchen <ArrowRight size={16} /></button></main>;

  const canvas = <CVCanvas doc={doc} editing={editing && !isReadonly} readonly={isReadonly} update={update}
    onPhoto={() => { if (!isReadonly) photoInput.current?.click(); }} onEditEntry={(sectionId, entryId) => setEntryEditor({ sectionId, entryId })}
    onDeleteEntry={deleteEntry} onDeleteSection={deleteSection} onMoveSection={reorderSection} onMoveEntry={reorderEntry}
    onIcon={setIconTarget} onAddSection={() => setSectionDialog(true)} onPages={onPages} />;

  return <div className={`app-shell ${isReadonly ? 'readonly-view' : paneOpen ? 'pane-open' : 'pane-closed'}`}>
    {!isReadonly && <><input type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden" ref={photoInput} aria-label="Profilfoto auswählen" onChange={event => { void uploadPhoto(event.target.files?.[0]); event.target.value = ''; }} />
    <input type="file" accept=".json,application/json" className="visually-hidden" ref={backupInput} aria-label="CV-Sicherung importieren" onChange={event => void importFile(event)} /></>}
    {isReadonly ? <header className="readonly-topbar"><a href="#cv-document" className="readonly-identity"><div className="brand-mark">{doc.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div><strong>{doc.name}</strong><span>CURRICULUM VITAE</span></div></a><div className="readonly-contact-actions">{doc.phone && <a href={`tel:${doc.phone.replace(/[^+\d]/g, '')}`} className="readonly-phone" aria-label="Michael anrufen"><Phone size={16} /><span>Anrufen</span></a>}{doc.email && <a className="button secondary" href={`mailto:${doc.email}`} aria-label="Kontakt per E-Mail aufnehmen" title="Kontakt per E-Mail aufnehmen"><Mail size={16} /><span>Kontakt aufnehmen</span></a>}<button className="button primary" aria-label={exporting ? 'PDF wird erstellt' : 'PDF herunterladen'} title="PDF herunterladen" disabled={exporting} onClick={() => void pdf()}>{exporting ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />}<span>PDF herunterladen</span></button></div></header> : <>
      <header className="app-topbar"><Brand /><div className="topbar-divider" /><div className="document-identity"><span className="document-breadcrumb">Zentral gespeichert <ChevronRight size={11} /></span><strong>{doc.name.split(' ')[0] || 'Mein'}s Lebenslauf <ChevronDown size={12} /></strong></div><div className="topbar-save"><Status status={status} error={error} /></div><div className="topbar-actions"><button className="button secondary complete-top-button" data-tour="assistant" aria-label="CV vervollständigen" title="CV vervollständigen" onClick={() => { (document.activeElement as HTMLElement | null)?.blur(); setAssistantOpen(true); }}><Sparkles size={15} /><span>CV vervollständigen</span></button><div className="history-actions"><IconButton icon={Undo2} label="Rückgängig (Strg/Cmd + Z)" disabled={!canUndo} onClick={undo} /><IconButton icon={Redo2} label="Wiederholen (Strg/Cmd + Umschalt + Z)" disabled={!canRedo} onClick={redo} /></div><span className="action-divider" /><button className="button secondary share-top-button" onClick={() => { (document.activeElement as HTMLElement | null)?.blur(); setShareModal(true); }}><Share2 size={15} /><span>Teilen</span></button><button className="button primary pdf-button" onClick={() => void pdf()} disabled={exporting}>{exporting ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />}<span>{exporting ? 'PDF wird erstellt …' : 'PDF herunterladen'}</span></button></div></header>
      <nav className="navigation-rail" aria-label="Workspace-Navigation"><div className="rail-main-nav">{(Object.keys(paneMeta) as Pane[]).map(key => { const item = paneMeta[key]; const Icon = item.icon; return <button key={key} className={`rail-nav-item ${pane === key && paneOpen ? 'active' : ''}`} onClick={() => switchPane(key)} title={item.name} aria-expanded={pane === key && paneOpen}><Icon size={21} strokeWidth={1.6} /><span>{item.name}</span></button>; })}</div><div className="rail-bottom-nav"><IconButton icon={Keyboard} label="Tipps & Tastaturkürzel" onClick={() => setHelp(true)} /><div className="rail-avatar" title={doc.name}>{doc.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div></div></nav>
      {paneOpen && <aside className="context-pane"><header className="pane-header"><h1>{paneMeta[pane].title}</h1><p>{paneMeta[pane].description}</p><button className="pane-close" aria-label="Seitenleiste schließen" onClick={() => setPaneOpen(false)}><X size={15} /></button></header><div className="pane-scroll">
        {pane === 'design' && <>
          <div className="control-label"><span>Vorlage</span><span className="control-count">10 DESIGNS</span></div><div className="template-grid">{templateOptions.map(template => <TemplateThumbnail key={template.id} template={template} selected={doc.design.template === template.id} doc={doc} onClick={() => selectTemplate(template)} />)}</div>
          <section className="design-control-section"><div className="control-label"><span>Akzentfarbe</span><span className="color-hex">{doc.design.color.toUpperCase()}</span></div><div className="color-swatches">{colors.map(color => <button key={color} className={`color-swatch ${doc.design.color === color ? 'selected' : ''}`} style={{ '--swatch': color } as CSSProperties} onClick={() => design({ color })} aria-label={`Akzentfarbe ${color}`} aria-pressed={doc.design.color === color}>{doc.design.color === color && <Check size={13} />}</button>)}<label className="custom-color" title="Eigene Akzentfarbe"><Plus size={15} /><input type="color" value={doc.design.color} aria-label="Eigene Akzentfarbe auswählen" onChange={event => design({ color: event.target.value })} /></label></div></section>
          <section className="design-control-section"><div className="control-label"><span>Typografie</span><Type size={14} /></div><div className="font-options">{([{ id: 'sans', name: 'Sans', sample: 'Aa' }, { id: 'serif', name: 'Serif', sample: 'Aa' }, { id: 'mono', name: 'Mono', sample: 'Aa' }] as const).map(font => <button className={`font-option font-${font.id} ${doc.design.font === font.id ? 'active' : ''}`} key={font.id} onClick={() => design({ font: font.id })} aria-pressed={doc.design.font === font.id}><span>{font.sample}</span><small>{font.name}</small></button>)}</div></section>
          <section className="design-control-section density-control"><div className="control-label"><span>Abstände</span></div><div className="segmented"><button className={doc.design.density === 'comfortable' ? 'active' : ''} onClick={() => design({ density: 'comfortable' })}>Komfortabel</button><button className={doc.design.density === 'compact' ? 'active' : ''} onClick={() => design({ density: 'compact' })}>Kompakt</button></div></section>
          <section className="design-control-section"><div className="inline-setting footer-visibility"><span>Name & Seitenzahlen in der Fußzeile</span><Toggle checked={doc.design.showFooter !== false} label="Fußzeile im CV anzeigen" onChange={() => design({ showFooter: doc.design.showFooter === false })} /></div></section><div className="pane-tip"><Sparkles size={15} /><p>Dein Design. Deine Inhalte.<br /><span>Ein Wechsel übernimmt alles.</span></p></div>
        </>}
        {pane === 'content' && <>
          <button className="content-assistant-card" data-tour="assistant-content" onClick={() => setAssistantOpen(true)}><span><Layers size={13} /> DEINE BAUSTEINE</span><strong>CV vervollständigen</strong><p>Stärken, Projekte und alles, was dich außerdem ausmacht. Schritt für Schritt.</p><ArrowRight size={16} /></button><div className="module-checklist">{contentModules.map(module => <div key={module.id}><span className={moduleIsPresent(doc, module) ? 'complete' : ''}>{moduleIsPresent(doc, module) && <Check size={8} />}</span><span>{module.title}</span><small>{moduleIsPresent(doc, module) ? 'vorhanden' : 'optional'}</small></div>)}</div>
          <div className="content-intro"><Pencil size={15} /><p>Am schönsten direkt auf dem Papier.<button onClick={() => { setEditing(true); if (window.innerWidth < 750) setPaneOpen(false); }}>Im Canvas bearbeiten <ArrowRight size={12} /></button></p></div>
          <section className={`content-accordion ${openSections.includes('profile') ? 'open' : ''}`}><button className="accordion-trigger" onClick={() => toggleSection('profile')}><span className="accordion-icon"><Type size={15} /></span><span>Persönliche Angaben<small>Name, Kontakt & Kurzprofil</small></span><ChevronDown size={15} /></button>{openSections.includes('profile') && <div className="accordion-body"><Field label="Vollständiger Name" value={doc.name} onChange={value => profile('name', value)} /><Field label="Berufsbezeichnung" value={doc.title} onChange={value => profile('title', value)} /><Field label="E-Mail" value={doc.email} onChange={value => profile('email', value)} type="email" /><Field label="Telefon" value={doc.phone} onChange={value => profile('phone', value)} type="tel" /><Field label="Adresse" value={doc.address} onChange={value => profile('address', value)} /><Field label="Kurzprofil" value={doc.summary} onChange={value => profile('summary', value)} textarea /><div className="contact-symbol-settings"><span className="field-label">Kontaktsymbole</span>{([{ field: 'email', label: 'E-Mail' }, { field: 'phone', label: 'Telefon' }, { field: 'address', label: 'Adresse' }] as const).map(item => { const Icon = sectionIcons[targetIcon(doc, { kind: 'contact', field: item.field })]; return <button type="button" key={item.field} onClick={() => setIconTarget({ kind: 'contact', field: item.field })} aria-label={`${item.label}: Symbol ändern oder hinzufügen`}><Icon size={16} /><span>{item.label}</span><Pencil size={11} /></button>; })}</div>
            <div className="field-label link-label">Links & Profile</div>{doc.links.map(link => <div className="profile-link-item" key={link.id}><input value={link.label} placeholder="Bezeichnung, z. B. LinkedIn" aria-label="Link-Bezeichnung" onChange={event => update(current => ({ ...current, links: current.links.map(item => item.id === link.id ? { ...item, label: event.target.value } : item) }))} /><div><input value={link.url} placeholder="https://…" aria-label="Link-Adresse" onChange={event => update(current => ({ ...current, links: current.links.map(item => item.id === link.id ? { ...item, url: event.target.value } : item) }))} /><IconButton icon={sectionIcons[link.icon ?? 'link']} label="Linksymbol ändern oder hinzufügen" onClick={() => setIconTarget({ kind: 'link', id: link.id })} /><IconButton icon={Trash2} label="Link entfernen" onClick={() => update(current => ({ ...current, links: current.links.filter(item => item.id !== link.id) }))} /></div>{link.url && !safeLink(link.url) && <span className="field-error">Bitte eine gültige Webadresse eingeben.</span>}</div>)}<button className="add-text-button" disabled={doc.links.length >= 20} onClick={() => update(current => ({ ...current, links: [...current.links, { id: newId(), label: '', url: '' }] }))}><Plus size={14} /> Link hinzufügen</button>
          </div>}</section>
          <div className="control-label section-list-label"><span>Abschnitte</span><span className="control-count">{doc.sections.length}</span></div>
          {doc.sections.map((section, index) => { const Icon = sectionIcons[section.icon]; return <section className={`content-accordion ${openSections.includes(section.id) ? 'open' : ''} ${!section.visible ? 'section-hidden' : ''}`} key={section.id}><button className="accordion-trigger" onClick={() => toggleSection(section.id)}><span className="accordion-icon"><Icon size={15} /></span><span>{section.title}<small>{section.entries.length} {section.entries.length === 1 ? 'Eintrag' : 'Einträge'}{!section.visible ? ' · ausgeblendet' : ''}</small></span><ChevronDown size={15} /></button>{openSections.includes(section.id) && <div className="accordion-body"><Field label="Titel" value={section.title} onChange={value => update(current => ({ ...current, sections: current.sections.map(item => item.id === section.id ? { ...item, title: value } : item) }))} /><label className="field section-placement"><span>Platzierung im CV</span><select aria-label={`Platzierung: ${section.title || 'Abschnitt'}`} value={section.placement || 'auto'} onChange={event => update(current => ({ ...current, sections: current.sections.map(item => item.id === section.id ? { ...item, placement: event.target.value as 'auto' | 'main' | 'sidebar' } : item) }))}><option value="auto">Automatisch · passend zum Inhalt</option><option value="main">Hauptbereich</option><option value="sidebar">Zusatzbereich</option></select></label><div className="section-management"><IconButton icon={section.visible ? Eye : EyeOff} label={section.visible ? 'Abschnitt ausblenden' : 'Abschnitt einblenden'} onClick={() => update(current => ({ ...current, sections: current.sections.map(item => item.id === section.id ? { ...item, visible: !item.visible } : item) }))} /><IconButton icon={Icon} label="Abschnittssymbol ändern" onClick={() => setIconTarget({ kind: 'section', id: section.id })} /><IconButton icon={ArrowUp} label="Abschnitt nach oben" disabled={index === 0} onClick={() => reorderSection(section.id, -1)} /><IconButton icon={ArrowDown} label="Abschnitt nach unten" disabled={index === doc.sections.length - 1} onClick={() => reorderSection(section.id, 1)} /><IconButton icon={Trash2} label="Abschnitt entfernen" onClick={() => deleteSection(section.id)} /></div><div className="section-entry-list">{section.entries.map(entry => <div className="section-entry-row" key={entry.id}><button className="section-entry-main" onClick={() => setEntryEditor({ sectionId: section.id, entryId: entry.id })}><span>{entry.heading || 'Ohne Titel'}</span><small>{entry.period || entry.subheading || 'Eintrag bearbeiten'}</small></button><IconButton icon={MoreHorizontal} label={`„${entry.heading}“ bearbeiten`} onClick={() => setEntryEditor({ sectionId: section.id, entryId: entry.id })} /></div>)}</div><button className="add-text-button" onClick={() => setEntryEditor({ sectionId: section.id })}><Plus size={14} /> Eintrag hinzufügen</button></div>}</section>; })}
          <button className="button secondary add-section-button" onClick={() => setSectionDialog(true)}><Plus size={16} /> Abschnitt hinzufügen</button>
        </>}
        {pane === 'photo' && <>
          <div className={`photo-dropzone ${doc.photo ? 'has-photo' : ''}`} onDragOver={event => { event.preventDefault(); event.currentTarget.classList.add('drag-over'); }} onDragLeave={event => event.currentTarget.classList.remove('drag-over')} onDrop={event => { event.preventDefault(); event.currentTarget.classList.remove('drag-over'); void uploadPhoto(event.dataTransfer.files?.[0]); }}>
            {doc.photo ? <div className={`uploaded-photo-preview photo-${doc.design.photoShape}`}><img src={doc.photo} alt="Dein Profilfoto" /></div> : <div className="photo-upload-art"><div><Camera size={29} strokeWidth={1.2} /><span><Plus size={13} /></span></div></div>}
            <h3>{doc.photo ? 'Das bist du.' : 'Noch fehlt dein Lächeln.'}</h3><p>{doc.photo ? 'Ein guter erster Eindruck.' : <>Zieh dein Foto hierher oder<br />wähle es von deinem Gerät.</>}</p><button className="button primary" onClick={() => photoInput.current?.click()} disabled={uploading}>{uploading ? <LoaderCircle className="spin" size={15} /> : <Upload size={15} />}{doc.photo ? 'Foto ersetzen' : 'Foto hochladen'}</button><small>JPG, PNG oder WebP</small>
          </div><div className="design-control-section"><div className="inline-setting"><span>Foto im CV anzeigen</span><Toggle checked={doc.design.showPhoto} label="Foto im CV anzeigen" onChange={() => design({ showPhoto: !doc.design.showPhoto })} /></div></div><section className="design-control-section"><div className="control-label"><span>Bildform</span></div><div className="photo-shape-options">{([{ id: 'rounded', name: 'Weich' }, { id: 'circle', name: 'Rund' }, { id: 'square', name: 'Eckig' }] as const).map(shape => <button key={shape.id} className={doc.design.photoShape === shape.id ? 'active' : ''} onClick={() => design({ photoShape: shape.id })}><span className={`shape-sample shape-${shape.id}`} /><small>{shape.name}</small></button>)}</div></section>{doc.photo && <button className="button danger-quiet remove-photo" onClick={() => { update(current => ({ ...current, photo: '' })); notify('Foto entfernt.'); }}><Trash2 size={14} /> Foto entfernen</button>}<div className="pane-tip"><ShieldCheck size={15} /><p>Einmal hochgeladen, überall dabei.<br /><span>Dein Foto wird mit deinem CV gesichert.</span></p></div>
        </>}
        {pane === 'settings' && <>
          <div className="workspace-status-card"><div className="cloud-symbol"><Cloud size={24} strokeWidth={1.4} /><span className={status === 'saved' ? 'connected' : ''} /></div><h3>Dein CV bleibt bei dir.</h3><Status status={status} error={error} /><p>Änderungen und Bilder werden automatisch in der Cloud und zusätzlich auf diesem Gerät gespeichert.</p>{(status === 'offline' || status === 'error') && <><p className="settings-error">{error || 'Die Cloud ist gerade nicht erreichbar. Lokale Änderungen bleiben erhalten.'}</p><button className="button secondary" onClick={retry}>Verbindung erneut versuchen</button></>}</div>
          <div className="central-sync-note" data-tour="central-save"><CloudCheck size={19} /><p><strong>Ein CV. Auf allen Geräten.</strong>Melde dich einfach mit dem Passwort an. Dein aktueller Lebenslauf und deine Bilder werden überall automatisch geladen.</p></div><div className="settings-group"><span className="control-label">ZENTRALER SPEICHER</span><button className="settings-action" onClick={() => setConfirmation({ title: 'Zentral gespeicherten Stand laden?', description: 'Dieser CV wird auf allen Geräten geteilt. Lade eine Sicherung herunter, wenn du lokale Änderungen behalten möchtest.', action: 'Gespeicherten CV laden', run: () => { void workspace.reloadCloud().then(() => notify('Der zentral gespeicherte CV ist geladen.')).catch((cause: unknown) => notify(cause instanceof Error ? cause.message : 'Der CV konnte nicht geladen werden.', true)); } })}><Cloud size={18} /><span>Gespeicherten CV laden<small>Aktuellen Stand erneut abrufen</small></span><ChevronRight size={15} /></button></div>
          <div className="settings-group"><span className="control-label">DEINE DATEN</span><button className="settings-action" onClick={() => { downloadBackup(doc); notify('Deine CV-Sicherung wurde heruntergeladen.'); }}><FileDown size={18} /><span>Sicherung herunterladen<small>Alle Inhalte & Bilder als JSON</small></span><Download size={15} /></button><button className="settings-action" onClick={() => backupInput.current?.click()}><Upload size={18} /><span>Sicherung importieren<small>Einen gespeicherten Stand laden</small></span><ChevronRight size={15} /></button></div>
          <div className="settings-group"><span className="control-label">NEU ANFANGEN</span><button className="settings-action reset-action" onClick={() => setConfirmation({ title: 'Zur ursprünglichen Version zurück?', description: 'Deine aktuellen Inhalte, das Foto und das Design werden durch Michaels ursprünglichen Lebenslauf ersetzt. Lade vorher eine Sicherung herunter, wenn du den Stand behalten möchtest.', action: 'Ursprünglichen CV laden', run: () => { reset(); notify('Der ursprüngliche Lebenslauf ist wiederhergestellt.'); } })}><RotateCcw size={18} /><span>Ausgangsversion wiederherstellen<small>Michaels ursprünglicher Lebenslauf</small></span><ChevronRight size={15} /></button></div><div className="settings-group"><span className="control-label">DEIN ZUGANG & HILFE</span><button className="settings-action" onClick={() => { setHelp(false); setTourOpen(true); }}><Sparkles size={18} /><span>Tour erneut starten<small>Dein Studio in sieben Schritten</small></span><ChevronRight size={15} /></button><button className="settings-action" onClick={() => window.dispatchEvent(new Event('cv-studio-lock'))}><LogOut size={18} /><span>Studio sperren<small>Abmelden und Passwortschutz aktivieren</small></span><LockKeyhole size={15} /></button></div><div className="settings-privacy"><ShieldCheck size={15} /><p>Dein CV bleibt passwortgeschützt. Arbeitgeber erhalten ausschließlich die separate Leseansicht.</p></div><p className="settings-billing">Deine Änderungen werden zentral gesichert. Eine lokale Sicherung hilft dir zusätzlich, frühere Stände aufzubewahren.</p>
        </>}
      </div><footer className="pane-footer"><div className="footer-avatar">{doc.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div><strong>{doc.name}</strong><span>Auf allen deinen Geräten.</span></div><span className={`presence-dot ${status === 'error' || status === 'offline' ? 'is-offline' : ''}`} /></footer></aside>}
    </>}
    <main className="workspace-main" id="cv-document" ref={viewport}>
      <div className="workspace-toolbar"><div className="workspace-toolbar-left">{!isReadonly && <button className="sidebar-toggle" title={paneOpen ? 'Seitenleiste schließen' : 'Seitenleiste öffnen'} aria-label={paneOpen ? 'Seitenleiste schließen' : 'Seitenleiste öffnen'} onClick={() => setPaneOpen(value => !value)}><Menu size={16} /></button>}<span className="document-format">A4 <span>PORTRAIT</span></span><span className="toolbar-dot" /><span className="page-count">{pageCount} {pageCount === 1 ? 'Seite' : 'Seiten'}</span></div>{!isReadonly && <div className="mode-switch"><button className={!editing ? 'active' : ''} onClick={() => { (document.activeElement as HTMLElement | null)?.blur(); setEditing(false); }}><Eye size={14} /> Vorschau</button><button className={editing ? 'active' : ''} onClick={() => { setEditing(true); if (window.innerWidth < 750) setPaneOpen(false); }}><Pencil size={14} /> Bearbeiten</button></div>}<div className="zoom-controls"><IconButton icon={ZoomOut} label="Verkleinern" disabled={zoom <= 0.25} onClick={() => { setFit(false); setZoom(value => Math.max(0.2, +(value - 0.1).toFixed(2))); }} /><span>{Math.round(zoom * 100)}%</span><IconButton icon={ZoomIn} label="Vergrößern" disabled={zoom >= 1.4} onClick={() => { setFit(false); setZoom(value => Math.min(1.5, +(value + 0.1).toFixed(2))); }} /><span className="zoom-divider" /><IconButton icon={Maximize2} label="An Fensterbreite anpassen" onClick={() => { setFit(true); calculateZoom(); }} /></div></div>
      {!isReadonly && (status === 'error' || status === 'offline') && <div className="connection-banner"><CloudOff size={15} /><span>{error || 'Du arbeitest gerade lokal. Änderungen werden bei Verbindung erneut synchronisiert.'}</span><button onClick={retry}>Erneut verbinden</button></div>}
      <div className={`canvas-scroll ${editing ? 'editing-mode' : ''}`}>
        <div className="canvas-scale-wrapper" style={{ width: 794 * zoom, minHeight: (1123 * pageCount + 60 * pageCount + (editing ? 80 : 0)) * zoom }}><div className="canvas-scale" style={{ transform: `scale(${zoom})` }}>{canvas}</div></div>
        {isReadonly ? <div className="readonly-bottom"><span>Bereit für das nächste Gespräch.</span>{doc.email && <a href={`mailto:${doc.email}`}>Lass uns in Kontakt kommen <ArrowRight size={15} /></a>}<span className="made-with">Gestaltet mit <span className="tiny-brand">M</span> CV Studio</span></div> : <div className="workspace-bottom-note"><ShieldCheck size={12} /><span>Deine Ideen. Dein nächster Schritt.</span><i />{editing ? <span>Zum Speichern einfach außerhalb des Textes klicken.</span> : <span>PDF & Vorschau. Ein Design.</span>}</div>}
      </div>
    </main>
    {toast && <div className={`toast ${toast.error ? 'toast-error' : ''}`} role="status" aria-live="polite">{toast.error ? <CloudOff size={17} /> : <Check size={17} />}<span>{toast.message}</span><button onClick={() => setToast(null)} aria-label="Meldung schließen"><X size={14} /></button></div>}
    {uploading && <div className="upload-progress" role="status"><LoaderCircle size={18} className="spin" /> Dein Foto wird vorbereitet …</div>}
    {tourOpen && !isReadonly && <Onboarding onClose={() => { setTourOpen(false); if (window.innerWidth < 750) setPaneOpen(false); }} prepare={prepareTour} />}
    {shareModal && <ShareDialog share={share} name={doc.name} onClose={() => setShareModal(false)} notify={notify} />}
    {assistantOpen && <ContentAssistant doc={doc} onSave={update} onClose={() => setAssistantOpen(false)} />}
    {entryEditor && activeEntrySection && <EntryDialog key={`${entryEditor.sectionId}-${entryEditor.entryId || 'new'}`} section={activeEntrySection} entry={activeEntrySection.entries.find(entry => entry.id === entryEditor.entryId)} onClose={() => setEntryEditor(null)} notify={notify} onSave={entry => { update(current => ({ ...current, sections: current.sections.map(section => section.id !== entryEditor.sectionId ? section : { ...section, entries: entryEditor.entryId ? section.entries.map(item => item.id === entry.id ? entry : item) : [...section.entries, entry] }) })); setEntryEditor(null); notify('Eintrag übernommen.'); }} />}
    {sectionDialog && <SectionDialog onClose={() => setSectionDialog(false)} onSave={section => { update(current => ({ ...current, sections: [...current.sections, section] })); setSectionDialog(false); setEntryEditor({ sectionId: section.id }); }} />}
    {iconTarget && <Modal title="Dein Symbol. Dein Detail." onClose={() => setIconTarget(null)} className="symbol-modal"><p className="modal-description">Wähle ein Symbol oder entferne es ganz. Deine Auswahl wird mit deinem CV gespeichert.</p><IconChoices selected={targetIcon(doc, iconTarget)} onSelect={name => { update(current => withTargetIcon(current, iconTarget, name)); setIconTarget(null); }} /><button className="icon-default-button" onClick={() => { update(current => withTargetIcon(current, iconTarget, defaultTargetIcon(current, iconTarget))); setIconTarget(null); }}><RotateCcw size={14} /> Standardsymbol verwenden</button></Modal>}
    {confirmation && <Modal title={confirmation.title} eyebrow="DEIN WORKSPACE" onClose={() => setConfirmation(null)}><p className="modal-description confirmation-description">{confirmation.description}</p><div className="modal-actions"><button className="button secondary" onClick={() => setConfirmation(null)}>Abbrechen</button><button className="button danger" onClick={() => { confirmation.run(); setConfirmation(null); }}>{confirmation.action}</button></div></Modal>}
    {help && <Modal title="Kleine Handgriffe. Großer Unterschied." eyebrow="DEIN CV STUDIO" onClose={() => setHelp(false)}><button className="button primary restart-tour" onClick={() => { setHelp(false); setTourOpen(true); }}><Sparkles size={15} /> Tour erneut starten <ArrowRight size={14} /></button><div className="help-items"><div><Pencil size={20} /><p><strong>Direkt auf dem Papier bearbeiten</strong><span>Wähle „Bearbeiten“ und klicke auf einen Text. Änderungen werden übernommen, sobald du den Text verlässt.</span></p></div><div><Camera size={20} /><p><strong>Dein Foto, mit einem Klick</strong><span>Klicke auf den Fotoplatzhalter oder ziehe dein Bild in den Foto-Bereich.</span></p></div><div><Share2 size={20} /><p><strong>Teilen mit gutem Gefühl</strong><span>Die Leseansicht ist eine feste Momentaufnahme. Dein aktueller CV wird zentral gespeichert und nach der Anmeldung automatisch geladen.</span></p></div><div><Keyboard size={20} /><p><strong>Zurück geht immer</strong><span><kbd>Strg / ⌘</kbd> + <kbd>Z</kbd> Rückgängig<br /><kbd>Strg / ⌘</kbd> + <kbd>⇧</kbd> + <kbd>Z</kbd> Wiederholen</span></p></div></div></Modal>}
  </div>;
}

function Brand() { return <div className="brand"><div className="brand-mark"><span>M</span><i /></div><div className="brand-wordmark">michi<span>CV STUDIO</span></div></div>; }
