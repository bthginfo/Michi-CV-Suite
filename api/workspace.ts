import type { VercelRequest, VercelResponse } from '@vercel/node';
import { get, put, BlobPreconditionFailedError, BlobNotFoundError } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { documentSchema } from '../src/model.js';
import { documentPath, isSameOrigin, MAX_DOCUMENT_BYTES, parseCredential, uuidPattern } from '../server/security.js';
import { hasEditorSession } from '../server/auth.js';

export const config = { maxDuration: 30 };
type Stored = {document:unknown;savedAt:string};
const rateWindows = new Map<string,{count:number;expires:number}>();
function limited(key:string,limit:number) {
  const now=Date.now(); let window=rateWindows.get(key);
  if (!window || window.expires<now) { window={count:0,expires:now+3600000};rateWindows.set(key,window); }
  window.count++;
  if(rateWindows.size>1000) for(const [name,value] of rateWindows) if(value.expires<now) rateWindows.delete(name);
  return window.count>limit;
}
async function read(path:string) {
  try {
    const result = await get(path,{access:'private',useCache:false});
    if(!result || result.statusCode!==200 || !result.stream) return null;
    const data=JSON.parse(await new Response(result.stream).text()) as Stored;
    return {...data,etag:result.blob.etag};
  } catch(error) { if(error instanceof BlobNotFoundError) return null; throw error; }
}
function respond(res:VercelResponse,code:number,value:unknown) { return res.status(code).json(value); }
export default async function handler(req:VercelRequest,res:VercelResponse) {
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  if(!['GET','POST'].includes(req.method??'')) {res.setHeader('Allow','GET, POST');return respond(res,405,{error:'Diese Anfrage wird nicht unterstützt.'});}
  if(!isSameOrigin(req.headers.origin,req.headers.host)) return respond(res,403,{error:'Diese Anfrage ist nicht erlaubt.'});
  if(!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return respond(res,503,{error:'Der Cloud-Speicher ist noch nicht verbunden. Dein Entwurf bleibt auf diesem Gerät erhalten.'});
  try {
    if(req.method==='GET' && req.query.share!==undefined) {
      const id=req.query.share;
      if(typeof id!=='string' || !uuidPattern.test(id)) return respond(res,400,{error:'Dieser Freigabelink ist ungültig.'});
      const stored=await read(`shares/${id}.json`);
      if(!stored) return respond(res,404,{error:'Diese Leseansicht wurde nicht gefunden oder ist nicht mehr verfügbar.'});
      return respond(res,200,{document:stored.document,savedAt:stored.savedAt});
    }
    if(!hasEditorSession(req)) return respond(res,401,{error:'Deine Sitzung ist abgelaufen. Bitte erneut anmelden.',code:'AUTH_REQUIRED'});
    const credential=parseCredential(req.headers.authorization);
    if(!credential) return respond(res,401,{error:'Zum Bearbeiten ist dein privater Arbeitsplatz-Link erforderlich.'});
    const path=documentPath(credential);
    if(req.method==='GET') {
      const stored=await read(path);
      if(!stored) return respond(res,404,{error:'Dieser Arbeitsplatz wurde noch nicht gespeichert.'});
      return respond(res,200,stored);
    }
    if(!req.headers['content-type']?.includes('application/json')) return respond(res,415,{error:'Bitte gültige CV-Daten senden.'});
    const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body??{});
    if(Buffer.byteLength(raw,'utf8')>MAX_DOCUMENT_BYTES) return respond(res,413,{error:'Dein Lebenslauf ist größer als 2,5 MB. Bitte einzelne Bilder entfernen oder verkleinern; dein Entwurf bleibt lokal erhalten.'});
    let body:Record<string,unknown>;
    try {body=JSON.parse(raw);} catch {return respond(res,400,{error:'Die CV-Daten konnten nicht gelesen werden.'});}
    if(body.action==='share') {
      if(limited(`share:${credential.id}`,30)) return respond(res,429,{error:'Du hast sehr viele Links erstellt. Bitte später erneut versuchen.'});
      const stored=await read(path);
      if(!stored) return respond(res,404,{error:'Bitte den Lebenslauf vor dem Teilen speichern.'});
      const id=randomUUID();
      await put(`shares/${id}.json`,JSON.stringify({document:stored.document,savedAt:new Date().toISOString()}),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',cacheControlMaxAge:60});
      return respond(res,201,{id});
    }
    if(body.action!=='save') return respond(res,400,{error:'Diese Aktion ist ungültig.'});
    const parsed=documentSchema.safeParse(body.document);
    if(!parsed.success) return respond(res,400,{error:'Die CV-Daten sind ungültig. Bitte das zuletzt exportierte Backup verwenden.'});
    if(body.etag!==null && (typeof body.etag!=='string' || body.etag.length>200)) return respond(res,400,{error:'Der Speicherstand ist ungültig. Bitte die Cloud-Version neu laden.'});
    if(body.etag===null) {
      const ip=String(req.headers['x-forwarded-for']??'local').split(',')[0].trim();
      if(limited(`create:${ip}`,8)) return respond(res,429,{error:'Zu viele neue Arbeitsplätze. Bitte später erneut versuchen.'});
    }
    const savedAt=new Date().toISOString();
    const saved=await put(path,JSON.stringify({document:parsed.data,savedAt}),{
      access:'private',addRandomSuffix:false,allowOverwrite:body.etag!==null,
      ...(typeof body.etag==='string'?{ifMatch:body.etag}:{}),contentType:'application/json',cacheControlMaxAge:60,
    });
    return respond(res,200,{savedAt,etag:saved.etag});
  } catch(error) {
    if(error instanceof BlobPreconditionFailedError || (error instanceof Error && /already exists|overwrite/i.test(error.message))) return respond(res,409,{error:'Auf einem anderen Gerät wurde ein neuerer Stand gespeichert. Bitte zuerst ein Backup deines Entwurfs laden und dann die Cloud-Version öffnen.'});
    // Log only the class. Blob exception messages can contain private object URLs.
    console.error('workspace-storage',error instanceof Error?error.name:'UnknownError');
    return respond(res,503,{error:'Die Cloud ist gerade nicht erreichbar. Dein Entwurf bleibt lokal erhalten. Bitte erneut versuchen.'});
  }
}
