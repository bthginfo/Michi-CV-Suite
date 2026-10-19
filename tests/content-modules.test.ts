import test from 'node:test';
import assert from 'node:assert/strict';
import {contentModules,findSource,initialDrafts,insertModule,toEntries,emptyDraft,moduleDraftSignature} from '../src/contentModules.ts';
import {initialDocument} from '../src/seed.ts';
const module=(id:string)=>contentModules.find(item=>item.id===id)!;
for(const id of ['languages','interests','certificates'])test(`${id}: reuse baseline facts without duplicates or losing technical skills`,()=>{
  const doc=structuredClone(initialDocument),config=module(id),source=findSource(doc,config);
  const entries=toEntries(initialDrafts(source,config),config),saved=insertModule(doc,config,entries,source);
  assert.ok(entries.length>0);
  assert.equal(saved.sections.find(section=>section.id==='skills')?.entries.filter(entry=>entry.id==='measurement').length,1);
  if(id==='interests'){
    assert.deepEqual(entries.map(entry=>entry.heading),['Functional Training','Beachvolleyball','Foto- und Videobearbeitung']);
    assert.equal(saved.sections.find(section=>section.id==='skills')?.entries.some(entry=>entry.id==='hobbies'),false);
  }
  if(id==='languages'){
    assert.equal(entries[0].heading,'Englisch');assert.equal(entries[0].subheading,'in Wort und Schrift');
    assert.equal(saved.sections.find(section=>section.id==='skills')?.entries.some(entry=>entry.id==='language'),false);
  }
  if(id==='certificates'){assert.equal(saved.sections.length,doc.sections.length);assert.equal(entries.length,5);assert.equal(source.section?.id,'training');}
  const reopened=findSource(saved,config);
  const resaved=insertModule(saved,config,toEntries(initialDrafts(reopened,config),config),reopened);
  assert.deepEqual(resaved.sections,saved.sections);
});
test('project guidance preserves supplied context/contribution/result, inserts after experience, omits empty rows',()=>{
  const projects=module('projects'),draft={...emptyDraft(),values:{heading:'Testprojekt',subheading:'Eigene Rolle',context:'Ausgangslage',contribution:'Eigener Beitrag',result:'Belegtes Ergebnis'}};
  const entries=toEntries([draft,emptyDraft()],projects);assert.equal(entries.length,1);
  assert.match(entries[0].body,/Kontext: Ausgangslage\nMein Beitrag: Eigener Beitrag\nErgebnis: Belegtes Ergebnis/);
  const original=structuredClone(initialDocument),inserted=insertModule(original,projects,entries,{});
  assert.equal(inserted.sections[1].id,'module-projects');assert.deepEqual(inserted.sections[0],original.sections[0]);
  assert.equal(insertModule(original,projects,[],{}),original);
});

test('draft guard detects partially completed fields while ignoring blank rows and regenerated IDs',()=>{
  const projects=module('projects');
  const empty=moduleDraftSignature([emptyDraft()],projects);
  assert.equal(moduleDraftSignature([emptyDraft(),{...emptyDraft(),values:{heading:'  ',context:'\n'}}],projects),empty);
  const partial={...emptyDraft(),values:{context:'A useful detail before naming the project'}};
  assert.notEqual(moduleDraftSignature([partial],projects),empty);
  assert.equal(moduleDraftSignature([partial],projects),moduleDraftSignature([{...partial,id:'new-row-id'},emptyDraft()],projects));
  assert.notEqual(moduleDraftSignature([{...partial,values:{...partial.values,result:'Confirmed outcome'}}],projects),moduleDraftSignature([partial],projects));
});

test('assistant keeps meaningful body-only entries after their heading was removed',()=>{
  const config=module('strengths');
  const entries=toEntries([{...emptyDraft(),values:{heading:'',body:'Ein eigenes konkretes Beispiel'}},emptyDraft()],config);
  assert.equal(entries.length,1);assert.equal(entries[0].heading,'');assert.equal(entries[0].body,'Ein eigenes konkretes Beispiel');
});
