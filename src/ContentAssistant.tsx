import { useEffect, useMemo, useRef, useState, type SetStateAction } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Layers, Plus, Sparkles, Trash2, X } from 'lucide-react';
import type { CVDocument } from './model';
import { contentModules, emptyDraft, findSource, initialDrafts, insertModule, moduleDraftSignature, moduleIsPresent, toEntries, type Draft, type ModuleId, type Source } from './contentModules';
import { sectionIcons } from './icons';
import './assistant.css';

export default function ContentAssistant({ doc, onSave, onClose, initialModule }: { doc: CVDocument; onSave: (fn: (doc: CVDocument) => CVDocument) => void; onClose: () => void; initialModule?: ModuleId }) {
  const [selected, setSelected] = useState<ModuleId | null>(initialModule || null);
  const initialSignatures = useRef<Partial<Record<ModuleId, string>>>({});
  const [draftsByModule, setDraftsByModule] = useState<Partial<Record<ModuleId, Draft[]>>>(() => {
    const first = contentModules.find(item => item.id === initialModule);
    if (!first) return {};
    const prepared = initialDrafts(findSource(doc, first), first);
    initialSignatures.current[first.id] = moduleDraftSignature(prepared, first);
    return { [first.id]: prepared };
  });
  const [active, setActive] = useState(0);
  const [review, setReview] = useState(false);
  const [saved, setSaved] = useState('');
  const [closeConfirmation, setCloseConfirmation] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const module = contentModules.find(item => item.id === selected);
  const drafts = selected ? draftsByModule[selected] || [] : [];
  const setDrafts = (action: SetStateAction<Draft[]>) => {
    if (!selected) return;
    setDraftsByModule(current => ({ ...current, [selected]: typeof action === 'function' ? action(current[selected] || []) : action }));
  };
  const moduleHasChanges = (id: ModuleId) => {
    const config = contentModules.find(item => item.id === id)!;
    return initialSignatures.current[id] !== undefined && moduleDraftSignature(draftsByModule[id] || [], config) !== initialSignatures.current[id];
  };
  const hasUnsavedChanges = contentModules.some(item => moduleHasChanges(item.id));
  const unsaved = useRef(hasUnsavedChanges); unsaved.current = hasUnsavedChanges;
  const source = useMemo<Source>(() => module ? findSource(doc, module) : {}, [doc, module]);
  const entries = module ? toEntries(drafts, module) : [];
  const requestClose = () => { if (hasUnsavedChanges) setCloseConfirmation(true); else onClose(); };
  const close = useRef(requestClose); close.current = requestClose;
  const confirming = useRef(closeConfirmation); confirming.current = closeConfirmation;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => root.current?.querySelector<HTMLElement>('.assistant-module-row, .assistant-form input, button')?.focus(), 60);
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); if (confirming.current) setCloseConfirmation(false); else close.current(); }
      if (event.key !== 'Tab') return;
      const scope = root.current?.querySelector<HTMLElement>('.assistant-close-dialog') || root.current;
      const elements = scope?.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea,select,[tabindex="0"]');
      if (!elements?.length) return;
      if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements[elements.length - 1].focus(); }
      if (!event.shiftKey && document.activeElement === elements[elements.length - 1]) { event.preventDefault(); elements[0].focus(); }
    };
    window.addEventListener('keydown', keyboard);
    const leaving = (event: BeforeUnloadEvent) => { if (unsaved.current) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', leaving);
    return () => { window.clearTimeout(focusTimer); window.removeEventListener('keydown', keyboard); window.removeEventListener('beforeunload', leaving); previous?.focus(); };
  }, []);
  useEffect(() => {
    if (!module) return;
    const timer = window.setTimeout(() => root.current?.querySelector<HTMLInputElement>('.assistant-form input')?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [selected]);
  useEffect(() => {
    if (!closeConfirmation) return;
    const previous = document.activeElement as HTMLElement | null;
    root.current?.querySelector<HTMLButtonElement>('.assistant-keep-writing')?.focus();
    return () => previous?.focus();
  }, [closeConfirmation]);
  const choose = (id: ModuleId) => {
    if (!draftsByModule[id]) {
      const config = contentModules.find(item => item.id === id)!;
      const prepared = initialDrafts(findSource(doc, config), config);
      initialSignatures.current[id] = moduleDraftSignature(prepared, config);
      setDraftsByModule(current => ({ ...current, [id]: prepared }));
    }
    setSelected(id); setActive(0); setReview(false); setSaved('');
  };
  const back = () => { if (review) setReview(false); else setSelected(null); };
  const clearModule = (id: ModuleId) => {
    delete initialSignatures.current[id];
    setDraftsByModule(current => { const next = { ...current }; delete next[id]; return next; });
  };
  const skipModule = () => { if (selected) clearModule(selected); setSelected(null); setReview(false); };
  const commit = () => {
    if (!module || !entries.length) return;
    onSave(current => insertModule(current, module, entries, findSource(current, module)));
    clearModule(module.id);
    setSaved(`${module.title} ist jetzt Teil deines CVs.`); setSelected(null); setReview(false);
  };
  const current = drafts[active];
  const ModuleIcon = module ? sectionIcons[module.icon] : Layers;
  return <div className="modal-backdrop assistant-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) requestClose(); }}>
    <section className={`assistant-modal ${module ? 'has-module' : ''}`} role="dialog" aria-modal="true" aria-label="CV vervollständigen" ref={root}>
      <header className="assistant-header"><div className="assistant-wordmark"><span><Layers size={16} /></span><div>DEIN CV, MIT MEHR PERSÖNLICHKEIT<small>Die passenden Bausteine für deine Geschichte.</small></div></div><button onClick={requestClose} aria-label="Assistent schließen" className="icon-button"><X size={19} /></button></header>
      {!module ? <div className="assistant-discovery"><div className="assistant-intro"><span className="eyebrow">DEIN NÄCHSTES KAPITEL</span><h2>Was macht dich<br /><em>noch aus?</em></h2><p>Ein guter Lebenslauf zeigt mehr als Stationen. Ergänze, was zu dir passt. Alles hier ist freiwillig.</p><div className="assistant-small-note"><Sparkles size={15} /><span>Du bringst die Inhalte mit.<br />Wir helfen dir, sie auf den Punkt zu bringen.</span></div></div><div className="assistant-module-list">{saved && <div className="assistant-saved" role="status"><CheckCircle2 size={17} /> {saved}</div>}{contentModules.map(item => { const Icon = sectionIcons[item.icon]; const present = moduleIsPresent(doc, item); const pending = moduleHasChanges(item.id); return <button className="assistant-module-row" onClick={() => choose(item.id)} key={item.id}><span className="assistant-module-icon"><Icon size={20} strokeWidth={1.4} /></span><span><strong>{item.title}</strong><small>{item.short}</small></span><span className={`assistant-module-state ${pending ? 'pending' : present ? 'present' : ''}`}>{pending ? 'Entwurf' : present ? <><Check size={12} /> Vorhanden</> : 'Optional'}</span><ChevronRight size={16} /></button>; })}<p className="assistant-discovery-note">Vorhandene Angaben werden übernommen. Es werden keine Qualifikationen oder Erfolge erfunden.</p></div></div> : <>
        <div className="assistant-module-heading"><button className="assistant-back" onClick={back}><ArrowLeft size={15} /> {review ? 'Zurück zum Ausfüllen' : 'Alle Bausteine'}</button><div><span><ModuleIcon size={17} /> {module.title}</span><span className="assistant-step">{review ? '02 / PRÜFEN' : '01 / AUSFÜLLEN'}</span></div><h2>{review ? 'Passt das so zu dir?' : module.intro}</h2>{source.embedded && <p className="assistant-reuse"><Check size={13} /> Bereits vorhandene Angaben sind vorbereitet. Beim Speichern werden sie hier einsortiert.</p>}</div>
        <div className="assistant-workarea"><div className="assistant-form">{!review && <>
          <div className="assistant-entry-tabs">{drafts.map((draft, index) => <button key={draft.id} className={index === active ? 'active' : ''} onClick={() => setActive(index)}><span>{String(index + 1).padStart(2, '0')}</span>{draft.values.heading || `${module.item} ${index + 1}`}</button>)}</div>
          {current && <div className="assistant-fields">{module.fields.map(field => <label className="field" key={field.key}><span>{field.label}{field.required && <i> *</i>}</span>{field.multiline ? <textarea value={current.values[field.key] || ''} placeholder={field.placeholder} onChange={event => setDrafts(items => items.map((item, index) => index === active ? { ...item, values: { ...item.values, [field.key]: event.target.value } } : item))} rows={3} /> : <input value={current.values[field.key] || ''} placeholder={field.placeholder} onChange={event => setDrafts(items => items.map((item, index) => index === active ? { ...item, values: { ...item.values, [field.key]: event.target.value } } : item))} />}{field.tip && <small>{field.tip}</small>}</label>)}</div>}
          <div className="assistant-entry-actions"><button className="add-text-button" onClick={() => { setDrafts(items => [...items, emptyDraft()]); setActive(drafts.length); }}><Plus size={15} /> {module.item} ergänzen</button>{drafts.length > 1 && <button className="assistant-remove" onClick={() => { setDrafts(items => items.filter((_, index) => index !== active)); setActive(Math.max(0, active - 1)); }}><Trash2 size={13} /> Diesen Eintrag entfernen</button>}</div>
        </>}{review && <div className="assistant-review-copy"><CheckCircle2 size={31} strokeWidth={1.1} /><h3>Deine Angaben. Am richtigen Platz.</h3><p>{entries.length} {entries.length === 1 ? 'Eintrag wird' : 'Einträge werden'} als bearbeitbarer Abschnitt übernommen. {source.section ? 'Der vorhandene Abschnitt wird aktualisiert.' : module.id === 'projects' ? 'Deine Projekte stehen direkt nach deiner Berufserfahrung.' : module.id === 'certificates' ? 'Deine Qualifikationen stehen bei deiner Ausbildung.' : 'Der Baustein wird passend in deinen Lebenslauf einsortiert.'}</p><p>Leere Einträge erscheinen nicht im CV. Du kannst alles später im Canvas oder unter Inhalte ändern, ergänzen oder entfernen.</p></div>}</div>
          <aside className="assistant-preview"><span className="assistant-preview-label">SO FORMULIERST DU ES GERADE</span><div className="assistant-preview-paper"><div className="assistant-preview-name">{doc.name}</div><h3>{module.title}</h3>{entries.length ? entries.map(entry => <div className="assistant-preview-entry" key={entry.id}><small>{entry.period}</small><strong>{entry.heading}</strong>{entry.subheading && <span>{entry.subheading}</span>}{entry.body && <p>{entry.body}</p>}</div>) : <div className="assistant-preview-empty"><ModuleIcon size={25} strokeWidth={1.2} /><p>Deine Angaben erscheinen hier.<br />Trage links deinen ersten Eintrag ein.</p></div>}</div><span className="assistant-preview-footnote">Deine Vorlage gestaltet den Abschnitt automatisch.</span></aside>
        </div><footer className="assistant-footer"><button className="assistant-skip" onClick={skipModule}>{moduleHasChanges(module.id) ? 'Eingaben dieses Bausteins verwerfen' : 'Diesen Baustein überspringen'}</button><div><button className="button secondary" onClick={back}>{review ? 'Weiter bearbeiten' : 'Zurück'}</button><button className="button primary" disabled={!entries.length} onClick={() => review ? commit() : setReview(true)}>{review ? <>In meinen CV übernehmen <Check size={15} /></> : <>Angaben prüfen <ArrowRight size={15} /></>}</button></div></footer>
      </>}
      {!module && <footer className="assistant-footer"><span>{hasUnsavedChanges ? 'Deine begonnenen Eingaben bleiben hier erhalten. Übernimm sie, um sie im CV zu speichern.' : 'Dein CV wächst mit dir. Du kannst jederzeit zurückkommen.'}</span><button className="button secondary" onClick={requestClose}>Zurück zu meinem CV <ArrowRight size={14} /></button></footer>}
      {closeConfirmation && <div className="assistant-close-layer" onMouseDown={event => { if (event.target === event.currentTarget) setCloseConfirmation(false); }}><div className="assistant-close-dialog" role="alertdialog" aria-modal="true" aria-labelledby="assistant-close-title" aria-describedby="assistant-close-description"><span className="assistant-close-icon"><Layers size={22} strokeWidth={1.4} /></span><span className="eyebrow">DEINE EINGABEN SIND NOCH NICHT IM CV</span><h3 id="assistant-close-title">Deine Gedanken sind es wert,<br />festgehalten zu werden.</h3><p id="assistant-close-description">Du hast noch nicht übernommene Eingaben. Fülle weiter aus und übernimm sie in deinen CV – oder verwirf deine Entwürfe bewusst.</p><div><button className="button primary assistant-keep-writing" onClick={() => setCloseConfirmation(false)}>Weiter ausfüllen <ArrowRight size={14} /></button><button className="button secondary" onClick={onClose}>Entwürfe verwerfen</button></div></div></div>}
    </section>
  </div>;
}
