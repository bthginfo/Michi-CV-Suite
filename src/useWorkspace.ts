import { useCallback, useEffect, useRef, useState } from 'react';
import { documentSchema, type CVDocument } from './model';
import { initialDocument } from './seed';

const LOCAL_KEY = 'michi.cv.workspace.v1';
const CREDENTIAL = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-zA-Z0-9_-]{43}$/i;
export type SaveStatus = 'loading'|'saving'|'saved'|'offline'|'error';
type LocalWorkspace = {credential:string;document:CVDocument;etag:string|null;dirty:boolean};
type Update = CVDocument|((doc:CVDocument)=>CVDocument);
class CloudError extends Error { constructor(message:string,readonly status:number){super(message);} }
function makeCredential() {
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  const secret=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return `${crypto.randomUUID()}.${secret}`;
}
function readInitial() {
  let local:LocalWorkspace|null=null;
  try {
    const raw=JSON.parse(localStorage.getItem(LOCAL_KEY)??'null') as LocalWorkspace|null;
    if(raw && CREDENTIAL.test(raw.credential)) local={...raw,document:documentSchema.parse(raw.document),etag:typeof raw.etag==='string'?raw.etag:null,dirty:raw.dirty===true};
  }catch{/* A corrupt local backup never prevents opening a private recovery link. */}
  const hash=new URLSearchParams(location.hash.slice(1));
  const inbound=hash.get('workspace');
  const incoming=!!inbound && CREDENTIAL.test(inbound);
  if(incoming && local?.credential!==inbound) local={credential:inbound,document:structuredClone(initialDocument),etag:null,dirty:false};
  return {
    local:local??{credential:makeCredential(),document:structuredClone(initialDocument),etag:null,dirty:false},
    incoming,invalidIncoming:inbound!==null&&!incoming,
    isReadonly:new URLSearchParams(location.search).has('view'),
    shareId:new URLSearchParams(location.search).get('view'),
  };
}
async function request(url:string,init?:RequestInit) {
  const response=await fetch(url,{...init,cache:'no-store',signal:AbortSignal.timeout(25000)});
  let payload:Record<string,unknown>;
  try {payload=await response.json();}catch{throw new CloudError('Der Cloud-Speicher antwortet gerade nicht. Dein Entwurf bleibt auf diesem Gerät erhalten.',response.status);}
  if(response.status===401&&payload.code==='AUTH_REQUIRED')window.dispatchEvent(new Event('cv-studio-auth-required'));
  if(!response.ok) throw new CloudError(typeof payload.error==='string'?payload.error:'Der Cloud-Speicher ist gerade nicht erreichbar.',response.status);
  return payload;
}

export function useWorkspace() {
  const [initial]=useState(readInitial);
  const {isReadonly}=initial;
  const [doc,setDoc]=useState<CVDocument>(initial.local.document);
  const [status,setStatus]=useState<SaveStatus>('loading');
  const [error,setError]=useState<string|null>(initial.invalidIncoming?'Der private Bearbeitungslink ist ungültig. Bitte den vollständigen Link verwenden.':null);
  const [ready,setReady]=useState(false);
  const [,setHistoryVersion]=useState(0);
  const docRef=useRef(doc);
  const credential=useRef(initial.local.credential);
  const etag=useRef(initial.local.etag);
  const dirty=useRef(initial.local.dirty);
  const version=useRef(0);
  const readyRef=useRef(false);
  const inFlight=useRef<Promise<void>|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const back=useRef<CVDocument[]>([]);
  const forward=useRef<CVDocument[]>([]);
  const localIssue=useRef<string|null>(null);
  const headers=useCallback(()=>({'Content-Type':'application/json',Authorization:`Bearer ${credential.current}`}),[]);
  const writeLocal=useCallback(()=>{
    if(isReadonly)return;
    try {
      localStorage.setItem(LOCAL_KEY,JSON.stringify({credential:credential.current,document:docRef.current,etag:etag.current,dirty:dirty.current}));
      localIssue.current=null;
    }catch{
      localIssue.current='Die lokale Sicherung ist voll oder gesperrt. Bitte deinen privaten Bearbeitungslink oder ein Backup sichern, damit du den Cloud-Stand wieder öffnen kannst.';
      setError(localIssue.current);
    }
  },[isReadonly]);

  const sync=useCallback(async():Promise<void>=>{
    if(isReadonly || !readyRef.current)return;
    if(inFlight.current)return inFlight.current;
    const run=async()=>{
      // Keep the assignment below ahead of finally, including a clean/no-op save.
      await Promise.resolve();
      try {
        while(dirty.current){
          const savedVersion=version.current;
          const snapshot=docRef.current;
          setStatus('saving');
          const result=await request('/api/workspace',{method:'POST',headers:headers(),body:JSON.stringify({action:'save',document:snapshot,etag:etag.current})});
          if(typeof result.etag!=='string')throw new Error('Der Speicherstand konnte nicht bestätigt werden.');
          etag.current=result.etag;
          if(version.current===savedVersion)dirty.current=false;
          writeLocal();
        }
        setStatus('saved');setError(localIssue.current);
      }catch(cause){
        setStatus(cause instanceof CloudError&&cause.status<500?'error':'offline');
        const message=cause instanceof CloudError?cause.message:'Die Verbindung zur Cloud ist unterbrochen. Dein Entwurf bleibt lokal erhalten und wird bei bestehender Verbindung erneut gespeichert.';
        setError(message);writeLocal();throw cause;
      }finally{inFlight.current=null;}
    };
    const pending=run();inFlight.current=pending;return pending;
  },[headers,isReadonly,writeLocal]);

  useEffect(()=>{
    let cancelled=false;
    const boot=async()=>{
      try {
        if(isReadonly){
          if(!initial.shareId || !/^[0-9a-f-]{36}$/i.test(initial.shareId))throw new CloudError('Dieser Freigabelink ist ungültig.',400);
          const result=await request(`/api/workspace?share=${encodeURIComponent(initial.shareId)}`);
          const loaded=documentSchema.parse(result.document);
          if(cancelled)return;
          docRef.current=loaded;setDoc(loaded);setStatus('saved');setError(null);
        }else{
          writeLocal();
          try {
            const result=await request('/api/workspace',{headers:headers()});
            if(cancelled)return;
            const loaded=documentSchema.parse(result.document);
            if(typeof result.etag!=='string')throw new Error('Ungültiger Speicherstand.');
            if(dirty.current && etag.current!==result.etag){
              throw new CloudError('Auf einem anderen Gerät liegt ein neuerer Stand. Bitte deinen lokalen Entwurf als Backup sichern und anschließend die Cloud-Version laden.',409);
            }
            if(!dirty.current){docRef.current=loaded;setDoc(loaded);}
            etag.current=result.etag;writeLocal();setStatus('saved');setError(localIssue.current);
            if(initial.incoming)history.replaceState(null,'',location.pathname+location.search);
          }catch(cause){
            if(cancelled)return;
            if(cause instanceof CloudError && cause.status===404 && !initial.incoming && etag.current===null){setStatus('saved');}
            else throw cause;
          }
        }
      }catch(cause){
        if(cancelled)return;
        setStatus(cause instanceof CloudError&&cause.status<500?'error':'offline');
        setError(cause instanceof Error?cause.message:'Der Lebenslauf konnte nicht geladen werden.');
      }finally{
        if(!cancelled){readyRef.current=true;setReady(true);}
      }
    };
    void boot().then(()=>{if(!cancelled && !isReadonly && dirty.current)void sync().catch(()=>{});});
    return()=>{cancelled=true;};
  },[headers,initial,isReadonly,sync,writeLocal]);

  const commit=useCallback((next:CVDocument,record:boolean)=>{
    if(isReadonly)return;
    if(JSON.stringify(next)===JSON.stringify(docRef.current))return;
    if(record){back.current.push(docRef.current);if(back.current.length>40)back.current.shift();forward.current=[];}
    docRef.current=next;version.current++;dirty.current=true;setDoc(next);setHistoryVersion(v=>v+1);writeLocal();
    setStatus('saving');clearTimeout(timer.current);
    timer.current=setTimeout(()=>{void sync().catch(()=>{});},1200);
  },[isReadonly,sync,writeLocal]);
  const update=useCallback((next:Update)=>commit(typeof next==='function'?next(docRef.current):next,true),[commit]);
  const undo=useCallback(()=>{
    const previous=back.current.pop();if(!previous)return;forward.current.push(docRef.current);commit(previous,false);
  },[commit]);
  const redo=useCallback(()=>{
    const next=forward.current.pop();if(!next)return;back.current.push(docRef.current);commit(next,false);
  },[commit]);
  const reloadCloud=useCallback(async()=>{
    if(isReadonly)return;
    // Wait for the current save; a deliberate reload then adopts the remote version.
    if(inFlight.current)await inFlight.current.catch(()=>{});
    const result=await request('/api/workspace',{headers:headers()});
    const loaded=documentSchema.parse(result.document);
    if(typeof result.etag!=='string')throw new Error('Der Cloud-Stand ist ungültig.');
    docRef.current=loaded;etag.current=result.etag;dirty.current=false;version.current++;
    back.current=[];forward.current=[];setDoc(loaded);setHistoryVersion(v=>v+1);writeLocal();setStatus('saved');setError(localIssue.current);
  },[headers,isReadonly,writeLocal]);
  const retry=useCallback(async()=>{
    if(isReadonly){
      setStatus('loading');setError(null);
      try{
        const result=await request(`/api/workspace?share=${encodeURIComponent(initial.shareId??'')}`);
        const loaded=documentSchema.parse(result.document);docRef.current=loaded;setDoc(loaded);setStatus('saved');
      }catch(cause){setError(cause instanceof Error?cause.message:'Die Leseansicht konnte nicht geladen werden.');setStatus('error');}
      return;
    }
    if(dirty.current){await sync();return;}
    try{await reloadCloud();}catch(cause){setError(cause instanceof Error?cause.message:'Der Cloud-Stand konnte nicht geladen werden.');setStatus('offline');throw cause;}
  },[reloadCloud,sync,isReadonly,initial.shareId]);
  const ensureSaved=useCallback(async()=>{
    if(isReadonly)throw new Error('Eine Leseansicht kann nicht verändert werden.');
    if(!readyRef.current)throw new Error('Dein Arbeitsplatz wird noch geladen. Bitte einen Moment warten.');
    if(etag.current===null){dirty.current=true;writeLocal();}
    clearTimeout(timer.current);await sync();
    if(dirty.current)throw new Error('Bitte warten, bis alle Änderungen gespeichert wurden.');
  },[isReadonly,sync,writeLocal]);
  const share=useCallback(async()=>{
    await ensureSaved();
    const result=await request('/api/workspace',{method:'POST',headers:headers(),body:JSON.stringify({action:'share'})});
    if(typeof result.id!=='string')throw new Error('Der Freigabelink konnte nicht erstellt werden.');
    const url=new URL(location.pathname,location.origin);url.searchParams.set('view',result.id);return url.href;
  },[ensureSaved,headers]);
  const editorLink=useCallback(async()=>{
    await ensureSaved();const url=new URL(location.pathname,location.origin);url.hash=`workspace=${credential.current}`;return url.href;
  },[ensureSaved]);
  const reset=useCallback(()=>update(structuredClone(initialDocument)),[update]);
  const replace=useCallback((next:CVDocument)=>update(documentSchema.parse(next)),[update]);

  useEffect(()=>{
    if(isReadonly)return;
    const online=()=>{if(dirty.current)void sync().catch(()=>{});};
    const visibility=()=>{if(document.visibilityState==='hidden'&&dirty.current)void sync().catch(()=>{});};
    const unload=(event:BeforeUnloadEvent)=>{if(dirty.current){event.preventDefault();event.returnValue='';}};
    window.addEventListener('online',online);window.addEventListener('beforeunload',unload);document.addEventListener('visibilitychange',visibility);
    return()=>{window.removeEventListener('online',online);window.removeEventListener('beforeunload',unload);document.removeEventListener('visibilitychange',visibility);clearTimeout(timer.current);};
  },[isReadonly,sync]);
  return {doc,update,undo,redo,canUndo:back.current.length>0,canRedo:forward.current.length>0,status,error,ready,isReadonly,share,editorLink,reset,replace,retry,reloadCloud};
}
