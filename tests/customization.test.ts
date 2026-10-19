import test from 'node:test';
import assert from 'node:assert/strict';
import {documentSchema,templateIds,iconNames} from '../src/model.ts';
import {initialDocument} from '../src/seed.ts';
import {contentModules,findSource,initialDrafts,insertModule,toEntries} from '../src/contentModules.ts';
import {sectionIcons,iconLabels,matchesIcon,targetIcon,withTargetIcon,defaultTargetIcon} from '../src/icons.tsx';

test('old CVs retain their exact data while the ten template IDs remain available',()=>{
  assert.deepEqual(documentSchema.parse(initialDocument),initialDocument);
  assert.equal(templateIds.length,10);
  for(const template of ['nordic','editorial','studio','executive','mono','haven','copper','noir','lumen','summit']){
    assert.equal(documentSchema.safeParse({...initialDocument,design:{...initialDocument.design,template}}).success,true,template);
  }
});

test('removed and replaced icons, chosen column and hidden footer survive a JSON database round trip',()=>{
  const source={...structuredClone(initialDocument),contactIcons:{email:'none',phone:'heart',address:'globe'},
    links:[{id:'portfolio',label:'Portfolio',url:'https://example.org',icon:'code'}],
    sections:initialDocument.sections.map((section,index)=>index===0?{...section,icon:'none',placement:'sidebar'}:section),
    design:{...initialDocument.design,showFooter:false}};
  const saved=documentSchema.parse(JSON.parse(JSON.stringify(source)));
  assert.equal(saved.sections[0].icon,'none');
  assert.equal(saved.sections[0].placement,'sidebar');
  assert.deepEqual(saved.contactIcons,{email:'none',phone:'heart',address:'globe'});
  assert.equal(saved.links[0].icon,'code');
  assert.equal(saved.design.showFooter,false);
});

test('customization schema rejects unsupported icon identifiers and placement values',()=>{
  for(const bad of ['<script>','javascript:alert(1)','unregistered-icon']){
    assert.equal(documentSchema.safeParse({...initialDocument,contactIcons:{email:bad}}).success,false);
    assert.equal(documentSchema.safeParse({...initialDocument,links:[{id:'bad',label:'Test',url:'https://example.org',icon:bad}]}).success,false);
  }
  assert.equal(documentSchema.safeParse({...initialDocument,sections:[{...initialDocument.sections[0],placement:'floating'}]}).success,false);
});

test('revisiting a guided module preserves a cleared title, removed icon and manual column placement',()=>{
  const module=contentModules.find(item=>item.id==='languages')!;
  const original=structuredClone(initialDocument);
  const source=findSource(original,module);
  const inserted=insertModule(original,module,toEntries(initialDrafts(source,module),module),source);
  const custom=documentSchema.parse({...inserted,sections:inserted.sections.map(section=>section.id==='module-languages'?{...section,title:'',icon:'none',placement:'main'}:section)});
  const reopened=findSource(custom,module);
  const saved=insertModule(custom,module,toEntries(initialDrafts(reopened,module),module),reopened);
  assert.deepEqual(saved.sections,custom.sections);
});

test('every stored icon has an installed glyph, a label and searchable German text',()=>{
  for(const icon of iconNames){
    assert.ok(sectionIcons[icon],icon);
    assert.ok(iconLabels[icon],icon);
    assert.equal(matchesIcon(icon,iconLabels[icon]),true,icon);
  }
  assert.equal(matchesIcon('ear','zuhoren'),true);
  assert.equal(matchesIcon('camera','fotografie'),true);
  assert.equal(matchesIcon('mail','does-not-exist'),false);
});

test('icon editing addresses one exact contact, section or link and can restore its default',()=>{
  const original=structuredClone(initialDocument);
  original.links=[{id:'portfolio',label:'Portfolio',url:'https://example.org'},{id:'profile',label:'Profil',url:'https://example.net'}];
  const email={kind:'contact',field:'email'} as const;
  const section={kind:'section',id:original.sections[0].id} as const;
  const link={kind:'link',id:'portfolio'} as const;
  let edited=withTargetIcon(original,email,'none');
  edited=withTargetIcon(edited,section,'radar');
  edited=withTargetIcon(edited,link,'code');
  assert.equal(targetIcon(edited,email),'none');
  assert.equal(targetIcon(edited,section),'radar');
  assert.equal(targetIcon(edited,link),'code');
  assert.equal(targetIcon(edited,{kind:'contact',field:'phone'}),'phone');
  assert.deepEqual(edited.links[1],original.links[1]);
  assert.deepEqual(edited.sections.slice(1),original.sections.slice(1));
  assert.equal(original.contactIcons,undefined);
  const restored=withTargetIcon(edited,email,defaultTargetIcon(edited,email));
  assert.equal(targetIcon(documentSchema.parse(restored),email),'mail');
});
