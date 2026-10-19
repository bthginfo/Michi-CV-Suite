import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

export const SESSION_COOKIE = 'michi_editor';
const SESSION_SECONDS=60*60*24*7;
function signingKey(){
  const key=process.env.SESSION_SECRET??process.env.BLOB_READ_WRITE_TOKEN;
  if(!key)throw new Error('Server authentication is not configured.');
  return createHmac('sha256',key).update(`michi-cv-editor-session-v1:${process.env.EDITOR_PASSWORD??''}`).digest();
}
function sign(payload:string){return createHmac('sha256',signingKey()).update(payload).digest('base64url');}
export function hasEditorSession(req:Pick<IncomingMessage,'headers'>):boolean{
  try {
    const value=(req.headers.cookie??'').split(';').map(p=>p.trim()).find(p=>p.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length+1);
    if(!value)return false;
    const [expires,nonce,signature,...rest]=value.split('.');
    if(rest.length || !/^\d+$/.test(expires) || !/^[a-zA-Z0-9_-]{22}$/.test(nonce) || !/^[a-zA-Z0-9_-]{43}$/.test(signature))return false;
    const remaining=Number(expires)-Date.now();
    if(remaining<=0 || remaining>SESSION_SECONDS*1000+60000)return false;
    const expected=Buffer.from(sign(`${expires}.${nonce}`));
    const supplied=Buffer.from(signature);
    return supplied.length===expected.length && timingSafeEqual(supplied,expected);
  }catch{return false;}
}
export function passwordMatches(password:string):boolean{
  if(!process.env.EDITOR_PASSWORD || password.length>256)return false;
  const options={N:16384,r:8,p:1,maxmem:64*1024*1024};
  const expected=scryptSync(process.env.EDITOR_PASSWORD,'michi-cv-editor-v1',32,options);
  const supplied=scryptSync(password,'michi-cv-editor-v1',32,options);
  return timingSafeEqual(expected,supplied);
}
export function sessionCookie(secure:boolean):string{
  const payload=`${Date.now()+SESSION_SECONDS*1000}.${randomBytes(16).toString('base64url')}`;
  return `${SESSION_COOKIE}=${payload}.${sign(payload)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure?'; Secure':''}`;
}
export function clearSessionCookie(secure:boolean):string{
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure?'; Secure':''}`;
}
