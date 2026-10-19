// Integration test against the actual connected PRIVATE store; deletes only its own random fixtures.
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {del} from '@vercel/blob';
import {initialDocument} from '../src/seed.ts';
import {documentPath} from '../server/security.ts';

const origin=process.env.TEST_ORIGIN??'http://127.0.0.1:5174';
const id=randomUUID(),secret=randomBytes(32).toString('base64url');
const authorization=`Bearer ${id}.${secret}`;
let cookie='';
let shareId:string|undefined;
let createdFixture=false;
const doc=structuredClone(initialDocument);
doc.name='CV Studio Integration Test';
doc.photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
async function call(method:string,body?:unknown,auth:string|undefined=authorization,query=''){
  const response=await fetch(`${origin}/api/workspace${query}`,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:auth,Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:response.status,body:await response.json() as Record<string,unknown>};
}
try{
  assert.equal((await fetch(`${origin}/api/auth`).then(r=>r.json())).authenticated,false);
  const wrong=await fetch(`${origin}/api/auth`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'incorrect-test-password'})});
  assert.equal(wrong.status,401);
  const login=await fetch(`${origin}/api/auth`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:process.env.EDITOR_PASSWORD})});
  assert.equal(login.status,200);cookie=(login.headers.get('set-cookie')??'').split(';')[0];assert.ok(cookie.startsWith('michi_editor='));
  assert.equal((await call('POST',{action:'save',document:doc,etag:null},'')).status,401);
  const created=await call('POST',{action:'save',document:doc,etag:null});
  assert.equal(created.status,200,JSON.stringify(created.body));
  createdFixture=true;
  const firstEtag=created.body.etag;assert.equal(typeof firstEtag,'string');
  const read=await call('GET');assert.equal(read.status,200);
  assert.deepEqual(read.body.document,doc);
  assert.equal((await call('GET',undefined,`Bearer ${id}.${randomBytes(32).toString('base64url')}`)).status,404);
  doc.title='Persisted second revision';
  const saved=await call('POST',{action:'save',document:doc,etag:firstEtag});
  assert.equal(saved.status,200,JSON.stringify(saved.body));
  assert.notEqual(saved.body.etag,firstEtag);
  assert.equal((await call('POST',{action:'save',document:doc,etag:firstEtag})).status,409);
  const shared=await call('POST',{action:'share'});assert.equal(shared.status,201,JSON.stringify(shared.body));
  shareId=String(shared.body.id);
  doc.title='New private version after sharing';
  assert.equal((await call('POST',{action:'save',document:doc,etag:saved.body.etag})).status,200);
  const publicDoc=await call('GET',undefined,'',`?share=${shareId}`);
  assert.equal(publicDoc.status,200);
  assert.equal((publicDoc.body.document as {title:string}).title,'Persisted second revision');
  assert.equal('etag' in publicDoc.body,false);
  assert.equal((await call('POST',{action:'save',document:{...doc,photo:'https://external.invalid/x'},etag:null})).status,400);
  const cross=await fetch(`${origin}/api/workspace`,{method:'POST',headers:{Origin:'https://external.invalid','Content-Type':'application/json',Authorization:authorization,Cookie:cookie},body:JSON.stringify({action:'share'})});
  assert.equal(cross.status,403);
  console.log('PASS: password/session, private persistence + image, wrong-key denial, optimistic concurrency, immutable public share without login, input validation, origin protection.');
}finally{
  if(createdFixture){await del([documentPath({id,secret}),...(shareId?[`shares/${shareId}.json`]:[])]);console.log('Integration fixtures removed.');}
}
