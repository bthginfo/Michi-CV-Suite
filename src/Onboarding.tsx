import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from 'lucide-react';

export const TOUR_KEY = 'michi.cv.onboarding.v3';
type Pane = 'design' | 'content' | 'photo' | 'settings';
const steps: { title: string; description: string; target: string; pane?: Pane; sidebar: boolean; tag: string }[] = [
  { title: 'Zehn Designs. Dein eigener Stil.', description: 'Runde Boards, ein Magazin, eine Zeitleiste oder dunkles Papier: Entdecke zehn verschiedene Layouts. Mit „Seite 2“ siehst du auch die Qualifikationsseite. Deine Inhalte bleiben beim Wechsel erhalten.', target: '.template-grid', pane: 'design', sidebar: true, tag: 'DEIN LOOK' },
  { title: 'Eine Farbe. Deine Handschrift.', description: 'Wähle einen Akzent oder mische deine eigene Farbe. Darunter kannst du Schrift und Abstände anpassen. Alles erscheint sofort im CV.', target: '.color-swatches', pane: 'design', sidebar: true, tag: 'DIE DETAILS' },
  { title: 'Das Papier ist dein Editor.', description: 'Mit „Bearbeiten“ kannst du Texte direkt ändern oder leeren. Klicke auf ein Symbol, um ein neues zu suchen oder es zu entfernen. Änderungen werden automatisch gespeichert.', target: '.mode-switch', sidebar: false, tag: 'DIREKT BEARBEITEN' },
  { title: 'Mehr Persönlichkeit. Schritt für Schritt.', description: '„CV vervollständigen“ führt dich durch Stärken, Projekte, Sprachen und weitere Bausteine. Wähle für jeden Abschnitt den Hauptbereich oder den Zusatzbereich – die Vorlage ordnet ihn passend ein.', target: '[data-tour="assistant-content"]', pane: 'content', sidebar: true, tag: 'DEINE BAUSTEINE' },
  { title: 'Dein Foto. Ein Klick.', description: 'Lade dein Foto hoch oder ziehe es in dieses Feld. Du kannst es jederzeit ersetzen, ausblenden und die Form ändern. Das Bild wird mit deinem CV gespeichert.', target: '.photo-dropzone', pane: 'photo', sidebar: true, tag: 'PERSÖNLICH WERDEN' },
  { title: 'Bereit für den nächsten Schritt.', description: '„Teilen“ erstellt eine feste, öffentliche Leseansicht mit klickbaren Kontaktdaten. Daneben lädst du deinen Lebenslauf im gleichen Layout als PDF herunter.', target: '.topbar-actions', sidebar: false, tag: 'TEILEN & BEWERBEN' },
  { title: 'Ein CV. Auf allen Geräten.', description: 'Deine Änderungen und Bilder werden zentral gespeichert. Melde dich auf einem anderen Gerät mit dem Passwort an und arbeite am selben Lebenslauf weiter. Ganz ohne zusätzliche Links.', target: '[data-tour="central-save"]', pane: 'settings', sidebar: true, tag: 'GUT AUFGEHOBEN' },
];

export default function Onboarding({ onClose, prepare }: { onClose: () => void; prepare: (pane: Pane | undefined, sidebar: boolean) => void }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'bottom' });
  const tooltip = useRef<HTMLDivElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const prepareRef = useRef(prepare); prepareRef.current = prepare;
  const previous = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  const step = steps[index];
  const targetSelector = () => window.innerWidth < 750 && index === 0 ? '.template-option.is-selected' : window.innerWidth < 750 && index === 4 ? '.photo-dropzone .button' : step.target;
  const finish = () => { try { localStorage.setItem(TOUR_KEY, 'done'); } catch { /* An unavailable device store must not block the tour. */ } closeRef.current(); };
  const finishRef = useRef(finish); finishRef.current = finish;
  useEffect(() => {
    previous.current = document.activeElement as HTMLElement | null;
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); finishRef.current(); } };
    window.addEventListener('keydown', keyboard);
    return () => { window.removeEventListener('keydown', keyboard); previous.current?.focus(); };
  }, []);
  useLayoutEffect(() => {
    prepareRef.current(step.pane, step.sidebar);
    let cancelled = false;
    let frame = 0;
    let target: HTMLElement | null = null;
    const calculate = () => {
      if (cancelled) return;
      target = document.querySelector<HTMLElement>(targetSelector());
      if (!target) { setRect(null); return; }
      const bounds = target.getBoundingClientRect();
      const padding = 7;
      const safe = new DOMRect(Math.max(7, bounds.left - padding), Math.max(7, bounds.top - padding), Math.min(bounds.width + padding * 2, window.innerWidth - 14), Math.min(bounds.height + padding * 2, window.innerHeight - 14));
      const width = Math.min(340, window.innerWidth - 30);
      const height = tooltip.current?.offsetHeight || 270;
      let left = safe.right + 22;
      let top = Math.min(Math.max(16, safe.top + safe.height / 2 - height / 2), window.innerHeight - height - 16);
      let placement = 'right';
      if (left + width > window.innerWidth - 15) {
        left = Math.min(Math.max(15, safe.left + safe.width / 2 - width / 2), window.innerWidth - width - 15);
        if (safe.bottom + height + 24 < window.innerHeight) { top = safe.bottom + 20; placement = 'bottom'; }
        else if (safe.top > height + 30) { top = safe.top - height - 20; placement = 'top'; }
        else { top = Math.max(15, window.innerHeight - height - 20); placement = 'bottom'; }
      }
      setRect(safe); setPosition({ top, left, placement });
    };
    const timer = window.setTimeout(() => {
      target = document.querySelector<HTMLElement>(targetSelector());
      target?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      calculate(); nextButton.current?.focus();
    }, 100);
    const changed = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(calculate); };
    window.addEventListener('resize', changed); window.addEventListener('scroll', changed, true);
    const observer = new ResizeObserver(changed); observer.observe(document.body);
    return () => { cancelled = true; clearTimeout(timer); cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', changed); window.removeEventListener('scroll', changed, true); };
  }, [step]);
  return <div className="studio-tour" data-editor-only>
    {rect ? <>
      <div className="tour-blocker" style={{ top: 0, left: 0, width: '100%', height: rect.top }} />
      <div className="tour-blocker" style={{ top: rect.bottom, left: 0, width: '100%', bottom: 0 }} />
      <div className="tour-blocker" style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }} />
      <div className="tour-blocker" style={{ top: rect.top, left: rect.right, right: 0, height: rect.height }} />
      <div className="tour-highlight" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }} />
    </> : <div className="tour-blocker" style={{ inset: 0 }} />}
    <div className={`tour-tooltip tour-position-${position.placement}`} ref={tooltip} style={{ '--tour-top': `${position.top}px`, '--tour-left': `${position.left}px` } as CSSProperties} role="dialog" aria-label={`Einführung, Schritt ${index + 1} von ${steps.length}`} aria-describedby="tour-description">
      <div className="tour-top"><span><Sparkles size={12} /> {step.tag}</span><button aria-label="Einführung überspringen" onClick={finish}><X size={15} /></button></div>
      <h2>{step.title}</h2><p id="tour-description">{step.description}</p>
      <div className="tour-progress" aria-label={`Schritt ${index + 1} von ${steps.length}`}>{steps.map((_, number) => <i key={number} className={number <= index ? 'reached' : ''} />)}<span>{String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span></div>
      <div className="tour-actions"><button className="tour-skip" onClick={finish}>Überspringen</button><div>{index > 0 && <button className="tour-back" aria-label="Vorheriger Schritt" onClick={() => setIndex(value => value - 1)}><ArrowLeft size={15} /></button>}<button className="button primary" ref={nextButton} onClick={() => index === steps.length - 1 ? finish() : setIndex(value => value + 1)}>{index === steps.length - 1 ? <>Los geht’s <Check size={14} /></> : <>Weiter <ArrowRight size={14} /></>}</button></div></div>
    </div>
  </div>;
}
