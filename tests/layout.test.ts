import test from 'node:test';
import assert from 'node:assert/strict';
import { initialDocument } from '../src/seed.ts';
import { templateIds, type CVDocument } from '../src/model.ts';
import { accentColors, buildFragments, layoutSpecs, paginateFragments, type Fragment, type LayoutMeasure, type PagePlan } from '../src/layout.ts';

const flattened = (pages: PagePlan[]) => pages.flatMap(page => [...page.secondary, ...page.rows.flatMap(row => row.cells)]).flatMap(fragment => fragment.units);
const measure: LayoutMeasure = { height: fragment => 24 + fragment.units.length * 20, capacity: () => 220, gap: () => 12 };
const sourceKeys = (fragments: Fragment[]) => fragments.flatMap(fragment => fragment.units.map(unit => unit.key)).sort();

test('every composition retains each source unit exactly once, including split continuations', () => {
  for (const template of templateIds) {
    const doc = { ...initialDocument, design: { ...initialDocument.design, template } };
    const fragments = buildFragments(doc);
    const pages = paginateFragments(fragments, template, measure);
    assert.deepEqual(flattened(pages).map(unit => unit.key).sort(), sourceKeys(fragments), template);
    assert.equal(new Set(flattened(pages).map(unit => unit.key)).size, flattened(pages).length, template);
    for (const page of pages) {
      const occupied = page.rows.reduce((sum, row, index) => sum + Math.max(...row.cells.map(cell => measure.height(cell, 'full', page.kind))) + (index ? 12 : 0), 0);
      assert.ok(occupied <= 220, `${template}: ${occupied}`);
    }
    if (template === 'lumen') {
      const grouped = paginateFragments(fragments, template, { ...measure, capacity: () => 4000, groupHeight: cells => cells.reduce((sum, cell) => sum + measure.height(cell, 'full', 'first'), 0) });
      assert.deepEqual(flattened(grouped).map(unit => unit.key), fragments.flatMap(fragment => fragment.units.map(unit => unit.key)), 'portfolio spans retain exact source order');
      assert.equal(grouped.flatMap(page => page.rows).filter(row => row.layout).length, 2, 'both portfolio spreads group real source material');
      const fallback = paginateFragments(fragments, template, { ...measure, groupHeight: () => 10000 });
      assert.deepEqual(flattened(fallback).map(unit => unit.key), fragments.flatMap(fragment => fragment.units.map(unit => unit.key)), 'oversized groups fall back without dropping or duplicating units');
      const explicit = buildFragments({ ...doc, sections: doc.sections.map(section => ({ ...section, placement: 'main' })) });
      const fullWidth = paginateFragments(explicit, template, { ...measure, capacity: () => 4000, groupHeight: () => 100 });
      assert.ok(fullWidth.flatMap(page => page.rows).every(row => !row.layout), 'explicit full-width placement remains authoritative');
    }
  }
});

test('source offsets reconstruct arbitrary text exactly and never divide a web address', () => {
  const doc = structuredClone(initialDocument);
  doc.summary = `Profil ${'Entwicklung '.repeat(90)}https://example.org/portfolio/with-a-long-address?sample=value ${'Fahrzeug '.repeat(50)}`;
  doc.sections[0].entries[0].body = `${'Erfahrung '.repeat(100)}\n${'Analyse '.repeat(110)}`;
  const units = buildFragments(doc).flatMap(fragment => fragment.units);
  assert.equal(units.filter(unit => unit.type === 'summary').map(unit => unit.value).join(''), doc.summary);
  for (const [line, text] of doc.sections[0].entries[0].body.split('\n').entries()) {
    const chunks = units.filter(unit => unit.entry?.id === 'cariad' && unit.type === 'body' && unit.line === line);
    assert.equal(chunks.map(unit => unit.value).join(''), text);
    chunks.forEach(unit => assert.equal(text.slice(unit.start, unit.end), unit.value));
  }
  assert.ok(units.some(unit => unit.value?.includes('https://example.org/portfolio/with-a-long-address?sample=value')));
});

test('manually reordered sections retain their order and explicit secondary experience is preserved', () => {
  const doc = structuredClone(initialDocument);
  doc.sections = [doc.sections[1], { ...doc.sections[0], placement: 'sidebar' }, ...doc.sections.slice(2)];
  for (const template of templateIds) {
    doc.design.template = template;
    const fragments = buildFragments(doc);
    const order = [...new Set(fragments.flatMap(fragment => fragment.section ? [fragment.section.id] : []))];
    assert.deepEqual(order, doc.sections.map(section => section.id));
    assert.ok(fragments.filter(fragment => fragment.section?.id === 'experience').every(fragment => fragment.role === 'secondary'));
    assert.equal(fragments.find(fragment => fragment.section)?.section?.id, 'education');
    const pages = paginateFragments(fragments, template, measure);
    const actual = pages.flatMap(page => [...page.secondary, ...page.rows.flatMap(row => row.cells)]);
    for (const role of ['primary', 'secondary'] as const) {
      assert.deepEqual(actual.filter(fragment => fragment.role === role).flatMap(fragment => fragment.units.map(unit => unit.key)), fragments.filter(fragment => fragment.role === role).flatMap(fragment => fragment.units.map(unit => unit.key)), `${template}: ${role} reading order`);
    }
  }
});

test('an explicit main-area choice keeps a whole qualification panel full width', () => {
  const doc = structuredClone(initialDocument); doc.summary = ''; doc.design.template = 'nordic';
  doc.sections = [doc.sections[1], doc.sections[2]].map(section => ({ ...section, placement: 'main' }));
  const roomy: LayoutMeasure = { ...measure, capacity: () => 2000 };
  const pages = paginateFragments(buildFragments(doc), 'nordic', roomy);
  assert.ok(pages.flatMap(page => page.rows).every(row => !row.paired));
  const invisible = { ...doc.sections[0], id: 'hidden', visible: false };
  assert.ok(!buildFragments({ ...doc, sections: [invisible, ...doc.sections] }).some(fragment => fragment.section?.id === 'hidden'));
});

test('empty CVs and short career-only CVs never gain a manufactured qualification page', () => {
  for (const template of templateIds) {
    const doc: CVDocument = { ...initialDocument, summary: '', sections: [], design: { ...initialDocument.design, template } };
    assert.equal(paginateFragments(buildFragments(doc), template, measure).length, 1);
    doc.sections = [{ ...initialDocument.sections[0], entries: [initialDocument.sections[0].entries[3]] }];
    const pages = paginateFragments(buildFragments(doc), template, measure);
    assert.equal(pages.length, 1, template);
    assert.ok(pages.every(page => !page.chapter), template);
  }
});

test('body-only records and empty section titles survive fragment building and splitting', () => {
  const doc = structuredClone(initialDocument); doc.summary = '';
  doc.sections = [{ id: 'body', title: '', kind: 'custom', icon: 'none', visible: true, entries: [{ id: 'only', heading: '', subheading: '', period: '', body: 'Inhalt ohne Titel\nZweite Zeile', image: '' }] }];
  const fragments = buildFragments(doc);
  const pages = paginateFragments(fragments, 'nordic', measure);
  assert.equal(fragments[0].section?.title, '');
  assert.equal(fragments[0].section?.icon, 'none');
  assert.equal(flattened(pages).filter(unit => unit.type === 'body').map(unit => unit.value).join('\n'), doc.sections[0].entries[0].body);
});

test('a kept entry label moves with its first content rather than becoming an orphan', () => {
  const doc = structuredClone(initialDocument); doc.summary = '';
  doc.sections = [{ ...doc.sections[0], entries: [doc.sections[0].entries[0]] }];
  const fragments = buildFragments(doc);
  const short: LayoutMeasure = { ...measure, capacity: () => 130 };
  const pages = paginateFragments(fragments, 'editorial', short);
  assert.ok(pages[0].rows[0].cells[0].units.length >= 3);
  assert.deepEqual(flattened(pages).map(unit => unit.key).sort(), sourceKeys(fragments));
});

test('all ten stored IDs map to real different families and color-derived text stays readable at extremes', () => {
  const luminance = (hex: string) => {
    const channels = hex.match(/[a-f\d]{2}/gi)!.map(channel => { const value = parseInt(channel, 16) / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; });
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const contrast = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
  assert.deepEqual(Object.keys(layoutSpecs).sort(), [...templateIds].sort());
  assert.equal(new Set(Object.values(layoutSpecs).map(spec => spec.family)).size, 10);
  for (const template of templateIds) {
    for (const accent of ['#ffffff', '#000000', '#ffff00', '#2667c9', '#777777']) {
      const colors = accentColors(accent, template === 'copper');
      assert.equal(colors['--cv-accent'], accent);
      assert.match(colors['--cv-accent-ink'], /^#[a-f\d]{6}$/i);
      assert.ok(contrast(colors['--cv-accent-ink'], template === 'copper' ? '#211c19' : '#ffffff') >= 4.5, `${template}/${accent}: accent text`);
      assert.ok(contrast(colors['--cv-on-accent'], accent) >= 4.5, `${template}/${accent}: filled accent`);
    }
  }
});
