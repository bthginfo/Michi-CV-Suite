import test from 'node:test';
import assert from 'node:assert/strict';
import { documentSchema, safeLink } from '../src/model.ts';
import { initialDocument } from '../src/seed.ts';
import { isSameOrigin,uuidPattern } from '../server/security.ts';
import { randomUUID } from 'node:crypto';

test('provided CV survives validation with all four jobs and five training entries',()=>{
  const doc=documentSchema.parse(initialDocument);
  assert.equal(doc.sections.find(s=>s.id==='experience')?.entries.length,4);
  assert.equal(doc.sections.find(s=>s.id==='training')?.entries.length,5);
  assert.equal(doc.sections.flatMap(s=>s.entries).find(e=>e.id==='cariad')?.body.split('\n').length,9);
  assert.equal(doc.photo,'');
});
test('untrusted backups cannot inject executable photos or invalid colors',()=>{
  assert.equal(documentSchema.safeParse({...initialDocument,photo:'data:image/svg+xml;base64,PHN2Zz4='}).success,false);
  assert.equal(documentSchema.safeParse({...initialDocument,photo:'https://tracker.invalid/photo.png'}).success,false);
  assert.equal(documentSchema.safeParse({...initialDocument,design:{...initialDocument.design,color:'url(evil)'}}).success,false);
});
test('web link helper rejects executable protocols and handles normal domains',()=>{
  assert.equal(safeLink('javascript:alert(1)'),undefined);
  assert.equal(safeLink('data:text/html,<script>'),undefined);
  assert.equal(safeLink('www.linkedin.com/in/michael'),'https://www.linkedin.com/in/michael');
});
test('public snapshot identifiers reject paths and malformed IDs',()=>{
  assert.equal(uuidPattern.test(randomUUID()),true);
  assert.equal(uuidPattern.test('../../etc/passwd'),false);
  assert.equal(uuidPattern.test('michael'),false);
  assert.equal(uuidPattern.test('00000000-0000-0000-0000-000000000000'),false);
});
test('cross-origin state changes are rejected',()=>{
  assert.equal(isSameOrigin('https://michi-cv-suite.vercel.app','michi-cv-suite.vercel.app'),true);
  assert.equal(isSameOrigin('https://attacker.invalid','michi-cv-suite.vercel.app'),false);
  assert.equal(isSameOrigin('not-a-url','michi-cv-suite.vercel.app'),false);
});
