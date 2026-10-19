import { newId, type CVDocument, type CVEntry, type CVSection, type IconName } from './model';

export type ModuleId = 'strengths' | 'projects' | 'languages' | 'interests' | 'volunteering' | 'certificates' | 'references';
type Prompt = { key: string; label: string; placeholder: string; tip?: string; multiline?: boolean; required?: boolean };
export type Module = { id: ModuleId; title: string; short: string; intro: string; icon: IconName; item: string; match: RegExp; fields: Prompt[] };
export type Draft = { id: string; values: Record<string, string>; image: string };
export function moduleDraftSignature(drafts: Draft[], module: Module) {
  return JSON.stringify(drafts.map(draft => module.fields.map(field => [field.key, (draft.values[field.key] || '').trim()])).filter(fields => fields.some(([, value]) => Boolean(value))));
}
export const contentModules: Module[] = [
  { id: 'strengths', title: 'Stärken & Soft Skills', short: 'Wie du arbeitest. Was dich auszeichnet.', intro: 'Eine Stärke wird überzeugend, wenn sie zu deiner Arbeitsweise passt. Ein kleines Beispiel ist hilfreicher als eine lange Liste.', icon: 'sparkles', item: 'Stärke', match: /soft.?skills|stärken|persönliche kompetenz/i, fields: [
    { key: 'heading', label: 'Welche Stärke zeichnet dich aus?', placeholder: 'Zum Beispiel: analytisches Denken', required: true },
    { key: 'body', label: 'Woran zeigt sich das? · optional', placeholder: 'Ein konkreter Moment aus deinem Arbeitsalltag …', tip: 'Beschreibe kurz, wie du diese Stärke tatsächlich einsetzt.', multiline: true },
  ] },
  { id: 'projects', title: 'Projekte & Erfolge', short: 'Dein Beitrag, sichtbar auf den Punkt.', intro: 'Was war die Aufgabe, welchen Beitrag hast du geleistet und was ist daraus entstanden? Auch ein kleines Projekt kann viel zeigen.', icon: 'target', item: 'Projekt', match: /projekt|erfolge|ausgewählte arbeit/i, fields: [
    { key: 'heading', label: 'Projekt oder Erfolg', placeholder: 'Wie hieß das Projekt?', required: true },
    { key: 'subheading', label: 'Deine Rolle · optional', placeholder: 'Welche Verantwortung hattest du?' },
    { key: 'period', label: 'Zeitraum · optional', placeholder: 'Zum Beispiel: 2023 – 2024' },
    { key: 'context', label: '1. Der Kontext', placeholder: 'Was war die Aufgabe oder Herausforderung?', multiline: true },
    { key: 'contribution', label: '2. Dein Beitrag', placeholder: 'Was hast du konkret getan?', multiline: true },
    { key: 'result', label: '3. Das Ergebnis', placeholder: 'Was hat sich verbessert? Nur belegen, was du belegen kannst.', multiline: true },
  ] },
  { id: 'languages', title: 'Sprachen', short: 'Verständigung, die verbindet.', intro: 'Nenne deine Sprache und beschreibe dein Niveau so, wie es sich für dich richtig anfühlt. Vorhandene Angaben übernehmen wir.', icon: 'globe', item: 'Sprache', match: /^sprachen|sprachkenntnisse$/i, fields: [
    { key: 'heading', label: 'Sprache', placeholder: 'Zum Beispiel: Englisch', required: true },
    { key: 'subheading', label: 'Dein Niveau', placeholder: 'Zum Beispiel: verhandlungssicher oder B2', tip: 'Eine freie Beschreibung ist genauso möglich wie ein bekanntes Sprachniveau.' },
    { key: 'body', label: 'Zusätzlicher Kontext · optional', placeholder: 'Zum Beispiel: regelmäßige Zusammenarbeit im internationalen Team', multiline: true },
  ] },
  { id: 'interests', title: 'Interessen & Hobbys', short: 'Ein persönlicher Einblick.', intro: 'Was begeistert dich außerhalb des Berufs? Wähle wenige Interessen, die wirklich zu dir passen. Bereits genannte Hobbys sind schon vorbereitet.', icon: 'heart', item: 'Interesse', match: /interessen|hobbys|freizeit/i, fields: [
    { key: 'heading', label: 'Dein Interesse oder Hobby', placeholder: 'Zum Beispiel: Beachvolleyball', required: true },
    { key: 'body', label: 'Ein Satz dazu · optional', placeholder: 'Was macht dir daran Freude oder wie übst du es aus?', multiline: true },
  ] },
  { id: 'volunteering', title: 'Ehrenamt & Engagement', short: 'Wo du dich einbringst.', intro: 'Ein Verein, eine Initiative oder eine Aufgabe für andere: Zeig, wofür du dich engagierst und welchen Beitrag du leistest.', icon: 'user', item: 'Engagement', match: /ehrenamt|engagement/i, fields: [
    { key: 'heading', label: 'Organisation oder Initiative', placeholder: 'Wo engagierst du dich?', required: true },
    { key: 'subheading', label: 'Deine Aufgabe · optional', placeholder: 'Was ist deine Rolle?' },
    { key: 'period', label: 'Zeitraum · optional', placeholder: 'Seit wann oder in welchem Zeitraum?' },
    { key: 'body', label: 'Dein Beitrag · optional', placeholder: 'Was machst du dort konkret?', multiline: true },
  ] },
  { id: 'certificates', title: 'Zertifikate & Weiterbildung', short: 'Was du dazugelernt hast.', intro: 'Qualifikationen bekommen hier ihren Platz. Michaels vorhandene Weiterbildungen sind bereits übernommen und können ergänzt werden.', icon: 'award', item: 'Qualifikation', match: /weiterbildung|zertifikat|fortbildung/i, fields: [
    { key: 'heading', label: 'Anbieter oder Institution', placeholder: 'Wer hat die Qualifikation vergeben?', required: true },
    { key: 'subheading', label: 'Qualifikation oder Abschluss', placeholder: 'Wie heißt die Weiterbildung?' },
    { key: 'period', label: 'Abschluss oder Zeitraum · optional', placeholder: 'Zum Beispiel: 06/2024' },
    { key: 'body', label: 'Schwerpunkt · optional', placeholder: 'Was war der Schwerpunkt?', multiline: true },
  ] },
  { id: 'references', title: 'Referenzen', short: 'Menschen, die deine Arbeit kennen.', intro: 'Wenn du eine Referenz nennen möchtest, halte die Angaben knapp. Kontaktdaten ergänzt du mit Einverständnis der Person.', icon: 'briefcase', item: 'Referenz', match: /referenz|empfehlung/i, fields: [
    { key: 'heading', label: 'Name oder Organisation', placeholder: 'Wer kann deine Arbeit einordnen?', required: true },
    { key: 'subheading', label: 'Rolle oder Bezug · optional', placeholder: 'Zum Beispiel: frühere fachliche Leitung' },
    { key: 'body', label: 'Kontakt oder weiterer Hinweis · optional', placeholder: 'Kontaktdaten oder eine persönliche Ergänzung', multiline: true },
  ] },
];
export type Source = { section?: CVSection; embedded?: { sectionId: string; entry: CVEntry } };
export function findSource(doc: CVDocument, module: Module): Source {
  const section = doc.sections.find(item => item.id === `module-${module.id}` || (module.match.test(item.title) && !(module.id === 'interests' && /kenntnisse|fähigkeiten|skills/i.test(item.title))));
  if (section) return { section };
  if (module.id !== 'languages' && module.id !== 'interests') return {};
  for (const item of doc.sections) {
    const entry = item.entries.find(value => module.match.test(value.heading));
    if (entry) return { embedded: { sectionId: item.id, entry } };
  }
  return {};
}
export function moduleIsPresent(doc: CVDocument, module: Module) { const source = findSource(doc, module); return !!(source.embedded || source.section?.entries.some(entry => entry.heading.trim() || entry.body.trim())); }
export const emptyDraft = (): Draft => ({ id: newId(), values: {}, image: '' });
function entryDraft(entry: CVEntry, module: Module): Draft {
  const values: Record<string, string> = { heading: entry.heading, subheading: entry.subheading, period: entry.period, body: entry.body };
  if (module.id === 'projects') {
    const lines = entry.body.split('\n');
    for (const [key, prefix] of [['context', 'Kontext: '], ['contribution', 'Mein Beitrag: '], ['result', 'Ergebnis: ']]) values[key] = lines.filter(line => line.startsWith(prefix)).map(line => line.slice(prefix.length)).join('\n');
    if (!values.context && !values.contribution && !values.result) values.context = entry.body;
  }
  return { id: entry.id, values, image: entry.image };
}
export function initialDrafts(source: Source, module: Module): Draft[] {
  if (source.section?.entries.length) return source.section.entries.map(entry => entryDraft(entry, module));
  if (source.embedded) {
    const entry = source.embedded.entry;
    if (module.id === 'interests') return entry.body.split(/[,\n]/).filter(value => value.trim()).map(value => ({ ...emptyDraft(), values: { heading: value.trim(), body: '' } }));
    const language = entry.body.match(/^(Englisch|Deutsch|Französisch|Spanisch|Italienisch)\s+(.+)$/i);
    return [{ ...emptyDraft(), values: { heading: language?.[1] || entry.body, subheading: language?.[2] || '', body: '' } }];
  }
  return [emptyDraft()];
}
export function toEntries(drafts: Draft[], module: Module): CVEntry[] {
  return drafts.filter(draft => draft.values.heading?.trim()).map(draft => ({
    id: draft.id, heading: draft.values.heading.trim(), subheading: draft.values.subheading?.trim() || '', period: draft.values.period?.trim() || '', image: draft.image,
    body: module.id === 'projects' ? [['Kontext', draft.values.context], ['Mein Beitrag', draft.values.contribution], ['Ergebnis', draft.values.result]].filter(([, value]) => value?.trim()).map(([label, value]) => `${label}: ${String(value || '').trim()}`).join('\n') : draft.values.body?.trim() || '',
  }));
}
export function insertModule(doc: CVDocument, module: Module, entries: CVEntry[], source: Source): CVDocument {
  if (!entries.length) return doc;
  const id = source.section?.id || `module-${module.id}`;
  const section: CVSection = { id, title: source.section?.title || module.title, icon: source.section?.icon || module.icon, visible: true, kind: module.id === 'certificates' ? 'education' : module.id === 'strengths' || module.id === 'languages' || module.id === 'interests' ? 'skills' : 'custom', entries };
  const sections = doc.sections.map(item => source.embedded && item.id === source.embedded.sectionId ? { ...item, entries: item.entries.filter(entry => entry.id !== source.embedded?.entry.id) } : item);
  const existing = sections.findIndex(item => item.id === id);
  if (existing !== -1) sections[existing] = section;
  else {
    let after = -1;
    if (module.id === 'projects') sections.forEach((item, index) => { if (item.kind === 'experience') after = index; });
    else if (module.id === 'certificates') sections.forEach((item, index) => { if (item.kind === 'education') after = index; });
    else if (module.id === 'strengths' || module.id === 'languages') sections.forEach((item, index) => { if (item.kind === 'skills' && !/interessen|hobby/i.test(item.title)) after = index; });
    else after = sections.length - 1;
    sections.splice(after + 1, 0, section);
  }
  return { ...doc, sections };
}
