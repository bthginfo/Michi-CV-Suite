import type {VercelRequest,VercelResponse} from '@vercel/node';
import {documentSchema} from '../src/model.js';
import {isSameOrigin,MAX_DOCUMENT_BYTES,uuidPattern} from '../server/security.js';
import {hasEditorSession} from '../server/auth.js';
import {readCurrent,saveCurrent,createShare,readShare} from '../server/database.js';

export const config={maxDuration:30};
const shares=new Map<string,{count:number;until:number}>();
const conflict='Der CV wurde inzwischen auf einem anderen Gerät geändert. Bitte deinen Entwurf als Backup sichern und anschließend den neuesten Stand laden.';
export default async function handler(req:VercelRequest,res:VercelResponse){
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  if(!['GET','POST'].includes(req.method??'')){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Diese Anfrage wird nicht unterstützt.'});}
  if(!isSameOrigin(req.headers.origin,req.headers.host))return res.status(403).json({error:'Diese Anfrage ist nicht erlaubt.'});
  try{
    if(req.method==='GET'&&req.query.share!==undefined){
      const id=req.query.share;
      if(typeof id!=='string'||!uuidPattern.test(id))return res.status(400).json({error:'Dieser Freigabelink ist ungültig.'});
      const stored=await readShare(id);
      if(!stored)return res.status(404).json({error:'Diese Leseansicht wurde nicht gefunden oder ist nicht mehr verfügbar.'});
      return res.status(200).json(stored);
    }
    if(!hasEditorSession(req))return res.status(401).json({error:'Deine Sitzung ist abgelaufen. Bitte erneut anmelden.',code:'AUTH_REQUIRED'});
    if(req.method==='GET')return res.status(200).json(await readCurrent());
    if(!req.headers['content-type']?.includes('application/json'))return res.status(415).json({error:'Bitte gültige CV-Daten senden.'});
    const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body??{});
    if(Buffer.byteLength(raw,'utf8')>MAX_DOCUMENT_BYTES)return res.status(413).json({error:'Der CV ist größer als 2,5 MB. Bitte einzelne Bilder verkleinern; dein Entwurf bleibt lokal gesichert.'});
    let body:Record<string,unknown>;
    try{body=JSON.parse(raw);}catch{return res.status(400).json({error:'Die CV-Daten konnten nicht gelesen werden.'});}
    if(!body||typeof body!=='object'||Array.isArray(body))return res.status(400).json({error:'Bitte gültige CV-Daten senden.'});
    if(typeof body.etag!=='string'||!uuidPattern.test(body.etag))return res.status(409).json({error:conflict});
    if(body.action==='share'){
      const ip=String(req.headers['x-forwarded-for']??'local').split(',')[0].trim(),now=Date.now();
      let rate=shares.get(ip);if(!rate||rate.until<now){rate={count:0,until:now+3600000};shares.set(ip,rate);}
      if(shares.size>1000)for(const [key,value]of shares)if(value.until<now)shares.delete(key);
      if(++rate.count>30)return res.status(429).json({error:'Du hast sehr viele Links erstellt. Bitte später erneut versuchen.'});
      const id=await createShare(body.etag);
      return id?res.status(201).json({id}):res.status(409).json({error:conflict});
    }
    if(body.action!=='save'&&body.action!=='migrate')return res.status(400).json({error:'Diese Aktion ist ungültig.'});
    const parsed=documentSchema.safeParse(body.document);
    if(!parsed.success)return res.status(400).json({error:'Die CV-Daten sind ungültig. Bitte ein gültiges Backup verwenden.'});
    const saved=await saveCurrent(parsed.data,body.etag,body.action==='migrate');
    if(!saved)return res.status(409).json({error:conflict});
    return res.status(200).json({etag:saved.etag,savedAt:saved.savedAt});
  }catch(error){
    console.error('cv-database',error instanceof Error?error.name:'UnknownError');
    return res.status(503).json({error:'Der gespeicherte CV ist gerade nicht erreichbar. Dein Entwurf bleibt auf diesem Gerät gesichert. Bitte erneut versuchen.'});
  }
}
