import type {VercelRequest,VercelResponse} from '@vercel/node';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {hasEditorSession} from '../server/auth.js';
import {isSameOrigin,uuidPattern} from '../server/security.js';
import {shareExists} from '../server/database.js';
import type {Browser} from 'puppeteer-core';

export const config={maxDuration:60};
const requests=new Map<string,{count:number;until:number}>();
export default async function handler(req:VercelRequest,res:VercelResponse){
  res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Diese Anfrage wird nicht unterstützt.'});}
  if(!isSameOrigin(req.headers.origin,req.headers.host))return res.status(403).json({error:'Diese Anfrage ist nicht erlaubt.'});
  const ip=String(req.headers['x-forwarded-for']??'local').split(',')[0].trim();
  const now=Date.now();let limit=requests.get(ip);
  if(!limit||limit.until<now){limit={count:0,until:now+60000};requests.set(ip,limit);}
  if(requests.size>1000)for(const [key,value] of requests)if(value.until<now)requests.delete(key);
  if(++limit.count>8)return res.status(429).json({error:'Bitte einen Moment warten, bevor du das nächste PDF erstellst.'});
  let body:Record<string,unknown>;
  try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return res.status(400).json({error:'Die Vorschau konnte nicht gelesen werden.'});}
  if(!body||typeof body.html!=='string'||Buffer.byteLength(body.html,'utf8')>3_900_000)return res.status(413).json({error:'Die PDF-Vorschau ist zu groß. Bitte einzelne Bilder verkleinern.'});
  let browser:Browser|undefined;
  try{
    if(!hasEditorSession(req)){
      if(typeof body.shareId!=='string'||!uuidPattern.test(body.shareId))return res.status(401).json({error:'Bitte zuerst anmelden.',code:'AUTH_REQUIRED'});
      if(!await shareExists(body.shareId))return res.status(404).json({error:'Diese Freigabe ist nicht mehr verfügbar.'});
    }
    const [{default:puppeteer},{default:chromium}]=await Promise.all([import('puppeteer-core'),import('@sparticuz/chromium')]);
    let executablePath:string;
    if(process.platform==='linux')executablePath=await chromium.executablePath();
    else{
      const candidates=[process.env.CHROME_EXECUTABLE_PATH,join(process.env.LOCALAPPDATA??'','Google/Chrome/Application/chrome.exe'),join(process.env.PROGRAMFILES??'','Google/Chrome/Application/chrome.exe'),'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
      const found=candidates.find(candidate=>!!candidate&&existsSync(candidate));
      if(!found)throw new Error('Browser is unavailable.');executablePath=found;
    }
    browser=await puppeteer.launch({executablePath,headless:true,args:process.platform==='linux'?chromium.args:['--no-sandbox','--disable-dev-shm-usage'],timeout:25000});
    const page=await browser.newPage();
    // Render a static, self-contained document. Never execute submitted code or allow network/file access.
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on('request',request=>{if(request.url().startsWith('data:'))void request.continue();else void request.abort();});
    await page.setViewport({width:794,height:1123,deviceScaleFactor:1});
    await page.emulateMediaType('screen');
    await page.setContent(body.html,{waitUntil:'load',timeout:20000});
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(image=>image.decode().catch(()=>{})));});
    const pdf=await page.pdf({format:'A4',margin:{top:0,bottom:0,left:0,right:0},printBackground:true,preferCSSPageSize:true,tagged:true,timeout:25000});
    res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition','attachment; filename="Lebenslauf.pdf"');
    res.status(200);return res.end(Buffer.from(pdf));
  }catch(error){
    console.error('pdf-render',error instanceof Error?error.name:'UnknownError');
    return res.status(503).json({error:'Das PDF konnte gerade nicht erstellt werden. Bitte in einem Moment erneut versuchen.'});
  }finally{await browser?.close().catch(()=>{});}
}
