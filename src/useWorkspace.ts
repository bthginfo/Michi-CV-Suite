import {useCallback,useEffect,useRef,useState} from 'react';
import {documentSchema,type CVDocument} from './model';
import {initialDocument} from './seed';

const LOCAL_KEY='michi.cv.document.v2',LEGACY_KEY='michi.cv.workspace.v1';
const ETAG=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONFLICT='Der CV wurde inzwischen auf einem anderen Gerät geändert. Bitte deinen Entwurf als Backup sichern und anschließend den neuesten Stand laden.';
export type SaveStatus='loading'|'saving'|'saved'|'offline'|'error';
type LocalBackup={document:CVDocument;etag:string|null;dirty:boolean};
type Update=CVDocument|((document:CVDocument)=>CVDocument);
class CloudError extends Error{constructor(message:string,readonly status:number){super(message);}}
function readInitial(){
  let local:LocalBackup|null=null,legacy:CVDocument|null=null;
  try{
    const raw=JSON.parse(localStorage.getItem(LOCAL_KEY)??'null');
    if(raw)local={document:documentSchema.parse(raw.document),etag:typeof raw.etag==='string'&&ETAG.test(raw.etag)?raw.etag:null,dirty:raw.dirty===true};
  }catch{/* The central database remains authoritative if a device backup is corrupt. */}
  if(!local||(!local.etag&&!local.dirty))try{
    const previous=JSON.parse(localStorage.getItem(LEGACY_KEY)??'null');
    if(previous){const document=documentSchema.parse(previous.document);if(JSON.stringify(document)!==JSON.stringify(initialDocument))legacy=document;}
  }catch{/* An old device backup is optional. */}
  return {local:local??{document:legacy??structuredClone(initialDocument),etag:null,dirty:false},legacy,isReadonly:new URLSearchParams(location.search).has('view'),shareId:new URLSearchParams(location.search).get('view')};
}
async function request(url:string,init?:RequestInit){
  const response=await fetch(url,{...init,cache:'no-store',signal:AbortSignal.timeout(25000)});
  let payload:Record<string,unknown>;
  try{payload=await response.json();}catch{throw new CloudError('Der gespeicherte CV antwortet gerade nicht. Dein Entwurf bleibt auf diesem Gerät gesichert.',response.status);}
  if(response.status===401&&payload.code==='AUTH_REQUIRED')window.dispatchEvent(new Event('cv-studio-auth-required'));
  if(!response.ok)throw new CloudError(typeof payload.error==='string'?payload.error:'Der gespeicherte CV ist gerade nicht erreichbar.',response.status);
  return payload;
}

export function useWorkspace(){
  const [initial]=useState(readInitial),{isReadonly}=initial;
  const [doc,setDoc]=useState<CVDocument>(initial.local.document),[status,setStatus]=useState<SaveStatus>('loading');
  const [error,setError]=useState<string|null>(null),[ready,setReady]=useState(false);
  const [,setHistoryVersion]=useState(0);
  const docRef=useRef(doc),etag=useRef(initial.local.etag),dirty=useRef(initial.local.dirty),version=useRef(0);
  const readyRef=useRef(false),conflicted=useRef(false),inFlight=useRef<Promise<void>|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const back=useRef<CVDocument[]>([]),forward=useRef<CVDocument[]>([]),localIssue=useRef<string|null>(null);
  const writeLocal=useCallback(()=>{
    if(isReadonly)return;
    try{localStorage.setItem(LOCAL_KEY,JSON.stringify({document:docRef.current,etag:etag.current,dirty:dirty.current}));localIssue.current=null;}
    catch{localIssue.current='Die lokale Sicherung ist voll oder gesperrt. Bitte vor dem Schließen ein Backup herunterladen.';setError(localIssue.current);}
  },[isReadonly]);
  const sync=useCallback(async():Promise<void>=>{
    if(isReadonly||!readyRef.current)return;
    if(inFlight.current)return inFlight.current;
    const run=async()=>{
      await Promise.resolve();
      try{
        if(conflicted.current)throw new CloudError(CONFLICT,409);
        if(dirty.current&&!etag.current)throw new CloudError('Bitte zuerst den gespeicherten CV laden. Dein Entwurf bleibt lokal gesichert.',409);
        while(dirty.current){
          const savedVersion=version.current,snapshot=docRef.current;
          setStatus('saving');
          const result=await request('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save',document:snapshot,etag:etag.current})});
          if(typeof result.etag!=='string'||!ETAG.test(result.etag))throw new Error('Der Speicherstand konnte nicht bestätigt werden.');
          etag.current=result.etag;if(version.current===savedVersion)dirty.current=false;writeLocal();
        }
        setStatus('saved');setError(localIssue.current);
      }catch(cause){
        if(cause instanceof CloudError&&cause.status===409)conflicted.current=true;
        setStatus(cause instanceof CloudError&&cause.status<500?'error':'offline');
        setError(cause instanceof Error?cause.message:'Die Verbindung ist unterbrochen. Dein Entwurf bleibt auf diesem Gerät gesichert.');
        writeLocal();throw cause;
      }finally{inFlight.current=null;}
    };
    const pending=run();inFlight.current=pending;return pending;
  },[isReadonly,writeLocal]);
  useEffect(()=>{
    let cancelled=false;
    const boot=async()=>{
      try{
        if(isReadonly){
          if(!initial.shareId||!ETAG.test(initial.shareId))throw new CloudError('Dieser Freigabelink ist ungültig.',400);
          const result=await request(`/api/workspace?share=${encodeURIComponent(initial.shareId)}`);
          if(cancelled)return;
          docRef.current=documentSchema.parse(result.document);setDoc(docRef.current);setStatus('saved');setError(null);
        }else{
          let result=await request('/api/workspace');
          if(cancelled)return;
          if(typeof result.etag!=='string'||!ETAG.test(result.etag))throw new Error('Der Speicherstand ist ungültig.');
          if(dirty.current){
            if(etag.current!==result.etag&&!(etag.current===null&&result.pristine===true))throw new CloudError(CONFLICT,409);
          }else if(initial.legacy&&result.pristine===true){
            // One-time automatic adoption of a pre-database device draft, only while the central CV is untouched.
            try{
              const migrated=await request('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'migrate',document:initial.legacy,etag:result.etag})});
              result={...migrated,document:initial.legacy};
              try{localStorage.removeItem(LEGACY_KEY);}catch{/* The confirmed database copy is already safe. */}
            }catch(cause){if(cause instanceof CloudError&&cause.status===409)result=await request('/api/workspace');else throw cause;}
          }
          if(cancelled)return;
          if(!dirty.current){docRef.current=documentSchema.parse(result.document);setDoc(docRef.current);}
          etag.current=String(result.etag);conflicted.current=false;writeLocal();setStatus('saved');setError(localIssue.current);
          if(new URLSearchParams(location.hash.slice(1)).has('workspace'))history.replaceState(null,'',location.pathname+location.search);
        }
      }catch(cause){
        if(cancelled)return;
        if(cause instanceof CloudError&&cause.status===409)conflicted.current=true;
        setStatus(cause instanceof CloudError&&cause.status<500?'error':'offline');setError(cause instanceof Error?cause.message:'Der CV konnte nicht geladen werden.');
      }finally{if(!cancelled){readyRef.current=true;setReady(true);}}
    };
    void boot().then(()=>{if(!cancelled&&!isReadonly&&dirty.current&&!conflicted.current)void sync().catch(()=>{});});
    return()=>{cancelled=true;};
  },[initial,isReadonly,sync,writeLocal]);
  const commit=useCallback((next:CVDocument,record:boolean)=>{
    if(isReadonly||JSON.stringify(next)===JSON.stringify(docRef.current))return;
    if(record){back.current.push(docRef.current);if(back.current.length>40)back.current.shift();forward.current=[];}
    docRef.current=next;version.current++;dirty.current=true;setDoc(next);setHistoryVersion(v=>v+1);writeLocal();clearTimeout(timer.current);
    if(!conflicted.current){setStatus('saving');timer.current=setTimeout(()=>{void sync().catch(()=>{});},1200);}
  },[isReadonly,sync,writeLocal]);
  const update=useCallback((next:Update)=>commit(typeof next==='function'?next(docRef.current):next,true),[commit]);
  const undo=useCallback(()=>{const previous=back.current.pop();if(previous){forward.current.push(docRef.current);commit(previous,false);}},[commit]);
  const redo=useCallback(()=>{const next=forward.current.pop();if(next){back.current.push(docRef.current);commit(next,false);}},[commit]);
  const adopt=useCallback((result:Record<string,unknown>)=>{
    const loaded=documentSchema.parse(result.document);
    if(typeof result.etag!=='string'||!ETAG.test(result.etag))throw new Error('Der Speicherstand ist ungültig.');
    docRef.current=loaded;etag.current=result.etag;dirty.current=false;conflicted.current=false;version.current++;
    back.current=[];forward.current=[];setDoc(loaded);setHistoryVersion(v=>v+1);writeLocal();setStatus('saved');setError(localIssue.current);
  },[writeLocal]);
  const reloadCloud=useCallback(async()=>{
    if(isReadonly)return;
    clearTimeout(timer.current);if(inFlight.current)await inFlight.current.catch(()=>{});
    adopt(await request('/api/workspace'));
  },[adopt,isReadonly]);
  const retry=useCallback(async()=>{
    if(isReadonly){
      setStatus('loading');setError(null);
      try{const result=await request(`/api/workspace?share=${encodeURIComponent(initial.shareId??'')}`);docRef.current=documentSchema.parse(result.document);setDoc(docRef.current);setStatus('saved');}
      catch(cause){setError(cause instanceof Error?cause.message:'Die Leseansicht konnte nicht geladen werden.');setStatus('error');}
      return;
    }
    if(dirty.current){
      if(!etag.current){
        const remote=await request('/api/workspace');
        if(remote.pristine!==true||typeof remote.etag!=='string'||!ETAG.test(remote.etag)){conflicted.current=true;setStatus('error');setError(CONFLICT);throw new CloudError(CONFLICT,409);}
        etag.current=remote.etag;conflicted.current=false;writeLocal();
      }
      await sync();return;
    }
    try{await reloadCloud();}catch(cause){setError(cause instanceof Error?cause.message:'Der gespeicherte CV konnte nicht geladen werden.');setStatus('offline');throw cause;}
  },[initial.shareId,isReadonly,reloadCloud,sync,writeLocal]);
  const share=useCallback(async()=>{
    if(isReadonly)throw new Error('Eine Leseansicht kann nicht verändert werden.');
    if(!readyRef.current||!etag.current)throw new Error('Der gespeicherte CV wird noch geladen. Bitte einen Moment warten.');
    clearTimeout(timer.current);await sync();
    const result=await request('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'share',etag:etag.current})});
    if(typeof result.id!=='string'||!ETAG.test(result.id))throw new Error('Der Freigabelink konnte nicht erstellt werden.');
    const url=new URL(location.pathname,location.origin);url.searchParams.set('view',result.id);return url.href;
  },[isReadonly,sync]);
  const reset=useCallback(()=>update(structuredClone(initialDocument)),[update]);
  const replace=useCallback((next:CVDocument)=>update(documentSchema.parse(next)),[update]);
  useEffect(()=>{
    if(isReadonly)return;
    const refresh=async()=>{
      if(!readyRef.current||dirty.current||inFlight.current)return;
      try{const result=await request('/api/workspace');if(!dirty.current&&!inFlight.current&&result.etag!==etag.current)adopt(result);}
      catch{/* Keep the current confirmed copy; an actual save reports connectivity issues. */}
    };
    const online=()=>{if(dirty.current&&!conflicted.current)void sync().catch(()=>{});else void refresh();};
    const visibility=()=>{if(document.visibilityState==='hidden'&&dirty.current)void sync().catch(()=>{});else if(document.visibilityState==='visible')void refresh();};
    const storage=(event:StorageEvent)=>{if(event.key===LOCAL_KEY)void refresh();};
    const unload=(event:BeforeUnloadEvent)=>{if(dirty.current){event.preventDefault();event.returnValue='';}};
    window.addEventListener('online',online);window.addEventListener('focus',refresh);window.addEventListener('storage',storage);window.addEventListener('beforeunload',unload);document.addEventListener('visibilitychange',visibility);
    return()=>{window.removeEventListener('online',online);window.removeEventListener('focus',refresh);window.removeEventListener('storage',storage);window.removeEventListener('beforeunload',unload);document.removeEventListener('visibilitychange',visibility);clearTimeout(timer.current);};
  },[adopt,isReadonly,sync]);
  return {doc,update,undo,redo,canUndo:back.current.length>0,canRedo:forward.current.length>0,status,error,ready,isReadonly,share,reset,replace,retry,reloadCloud};
}
