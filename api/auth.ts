import type {VercelRequest,VercelResponse} from '@vercel/node';
import {clearSessionCookie,hasEditorSession,passwordMatches,sessionCookie} from '../server/auth.js';
import {isSameOrigin} from '../server/security.js';

const attempts=new Map<string,{count:number;until:number}>();
export default async function handler(req:VercelRequest,res:VercelResponse){
  res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const secure=req.headers['x-forwarded-proto']==='https' || process.env.VERCEL==='1';
  if(!isSameOrigin(req.headers.origin,req.headers.host))return res.status(403).json({error:'Diese Anfrage ist nicht erlaubt.'});
  if(req.method==='GET')return res.status(200).json({authenticated:hasEditorSession(req)});
  if(req.method==='DELETE'){res.setHeader('Set-Cookie',clearSessionCookie(secure));return res.status(200).json({authenticated:false});}
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST, DELETE');return res.status(405).json({error:'Diese Anfrage wird nicht unterstützt.'});}
  if(!process.env.EDITOR_PASSWORD)return res.status(503).json({error:'Der Zugang ist noch nicht eingerichtet.'});
  if(!req.headers['content-type']?.includes('application/json'))return res.status(415).json({error:'Ungültige Anmeldung.'});
  const ip=String(req.headers['x-forwarded-for']??'local').split(',')[0].trim();
  const now=Date.now();
  let rate=attempts.get(ip);
  if(!rate || rate.until<now){rate={count:0,until:now+15*60000};attempts.set(ip,rate);}
  if(rate.count>=10){res.setHeader('Retry-After','900');return res.status(429).json({error:'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.'});}
  let body:unknown;
  try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return res.status(400).json({error:'Ungültige Anmeldung.'});}
  const password=body&&typeof body==='object'&&'password' in body?body.password:undefined;
  if(typeof password!=='string' || password.length>256)return res.status(400).json({error:'Bitte dein Passwort eingeben.'});
  if(!passwordMatches(password)){rate.count++;return res.status(401).json({error:'Das Passwort stimmt nicht. Bitte erneut versuchen.'});}
  attempts.delete(ip);
  res.setHeader('Set-Cookie',sessionCookie(secure));
  return res.status(200).json({authenticated:true});
}
