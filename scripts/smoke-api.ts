// Real database/API verification. Write tests are restricted to the local named QA CV.
import assert from 'node:assert/strict';
import {sqlClient,documentId} from '../server/database.ts';
import type {CVDocument} from '../src/model.ts';
const origin=process.env.TEST_ORIGIN??'http://127.0.0.1:5174';
const local=['127.0.0.1','localhost'].includes(new URL(origin).hostname);
const mayWrite=local&&documentId().startsWith('qa-');
let cookie='',secondCookie='',shareId:string|undefined,original:CVDocument|undefined,currentEtag:string|undefined;
async function login(password:string){
  const response=await fetch(`${origin}/api/auth`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
  return {status:response.status,cookie:(response.headers.get('set-cookie')??'').split(';')[0]};
}
async function call(method:string,body?:unknown,session=cookie,query=''){
  const response=await fetch(`${origin}/api/workspace${query}`,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:response.status,body:await response.json() as Record<string,unknown>};
}
try{
  assert.equal((await call('GET',undefined,'')).status,401);
  assert.equal((await login('incorrect-test-password')).status,401);
  const one=await login(process.env.EDITOR_PASSWORD??''),two=await login(process.env.EDITOR_PASSWORD??'');
  assert.equal(one.status,200);assert.equal(two.status,200);cookie=one.cookie;secondCookie=two.cookie;
  const first=await call('GET');assert.equal(first.status,200,JSON.stringify(first.body));
  original=first.body.document as CVDocument;currentEtag=String(first.body.etag);
  const other=await call('GET',undefined,secondCookie);assert.equal(other.status,200);assert.deepEqual(other.body.document,original);assert.equal(other.body.etag,currentEtag);
  const direct=await sqlClient()`SELECT etag FROM cv_documents WHERE id=${local?documentId():'michael'}`;
  assert.equal(String(direct[0].etag),currentEtag,'API reads the actual shared Postgres row');
  if(mayWrite){
    const doc=structuredClone(original);doc.title='QA shared CV persistence';doc.photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
    const firstEtag=currentEtag;
    const save=await call('POST',{action:'save',document:doc,etag:currentEtag});assert.equal(save.status,200,JSON.stringify(save.body));currentEtag=String(save.body.etag);
    const onSecondDevice=await call('GET',undefined,secondCookie);assert.deepEqual(onSecondDevice.body.document,doc);
    assert.equal((await call('POST',{action:'save',document:doc,etag:firstEtag})).status,409);
    assert.equal((await call('POST',{action:'migrate',document:doc,etag:currentEtag})).status,409,'legacy migration never replaces an edited central CV');
    assert.equal((await call('POST',{action:'save',document:{...doc,photo:'https://external.invalid/x'},etag:currentEtag})).status,400);
    const shared=await call('POST',{action:'share',etag:currentEtag});assert.equal(shared.status,201);shareId=String(shared.body.id);
    doc.title='QA later private revision';const secondSave=await call('POST',{action:'save',document:doc,etag:currentEtag});assert.equal(secondSave.status,200);currentEtag=String(secondSave.body.etag);
    const publicRead=await call('GET',undefined,'',`?share=${shareId}`);assert.equal(publicRead.status,200);assert.equal((publicRead.body.document as CVDocument).title,'QA shared CV persistence');assert.equal('etag' in publicRead.body,false);
    assert.equal((await call('POST',{action:'share',etag:firstEtag})).status,409,'a stale device cannot share a different unseen version');
    const cross=await fetch(`${origin}/api/workspace`,{method:'POST',headers:{Origin:'https://external.invalid','Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({action:'share',etag:currentEtag})});assert.equal(cross.status,403);
    console.log('PASS: real shared Postgres CV across two independent logins, photo persistence, safe concurrency/migration, immutable public share, schema and origin guards.');
  }else console.log('PASS: production password gate and two independent logins load the same central Postgres CV. No production CV changed.');
}finally{
  if(mayWrite&&original&&currentEtag){const restore=await call('POST',{action:'save',document:original,etag:currentEtag});assert.equal(restore.status,200,'QA CV restoration failed; a concurrent tester may have edited it.');}
  if(shareId)await sqlClient()`DELETE FROM cv_shares WHERE id=${shareId}::uuid AND source_id=${documentId()}`;
}
