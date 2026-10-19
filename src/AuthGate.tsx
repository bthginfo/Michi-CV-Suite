import {useEffect,useState,type FormEvent,type ReactNode} from 'react';
import {ArrowRight,Eye,EyeOff,LockKeyhole,LoaderCircle,ShieldCheck} from 'lucide-react';

export default function AuthGate({children}:{children:ReactNode}){
  const readonly=new URLSearchParams(location.search).has('view');
  const [authenticated,setAuthenticated]=useState<boolean|null>(readonly?true:null);
  const [password,setPassword]=useState('');
  const [visible,setVisible]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    if(readonly)return;
    let active=true;
    void fetch('/api/auth',{cache:'no-store'}).then(r=>r.json()).then(v=>{if(active)setAuthenticated(v.authenticated===true);}).catch(()=>{if(active){setAuthenticated(false);setError('Die Verbindung ist gerade unterbrochen. Bitte erneut versuchen.');}});
    const lock=()=>{setAuthenticated(false);setPassword('');void fetch('/api/auth',{method:'DELETE'}).catch(()=>{});};
    const expired=()=>{setAuthenticated(false);setPassword('');setError('Deine Sitzung ist abgelaufen. Bitte erneut anmelden.');};
    window.addEventListener('cv-studio-lock',lock);window.addEventListener('cv-studio-auth-required',expired);
    return()=>{active=false;window.removeEventListener('cv-studio-lock',lock);window.removeEventListener('cv-studio-auth-required',expired);};
  },[readonly]);
  const login=async(event:FormEvent)=>{
    event.preventDefault();setBusy(true);setError(null);
    try{
      const response=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error??'Die Anmeldung ist gerade nicht möglich.');
      setPassword('');setAuthenticated(true);
    }catch(cause){setError(cause instanceof Error?cause.message:'Die Anmeldung ist gerade nicht möglich.');}
    finally{setBusy(false);}
  };
  if(authenticated===true)return children;
  return <main className="auth-screen">
    <a className="auth-brand" href="/"><span className="auth-monogram">M<span>·</span></span><span>CV STUDIO<span className="auth-brand-sub">Ein guter Eindruck beginnt hier.</span></span></a>
    <div className="auth-composition"><div className="auth-copy"><span className="auth-eyebrow">DEIN NÄCHSTES KAPITEL.</span><h1>Deine Erfahrung.<br/><span>Dein Auftritt.</span></h1><p>Ein Lebenslauf, der zu dir passt.<br/>Mit Klarheit gestaltet. Mit einem Klick geteilt.</p><div className="auth-features"><span><ShieldCheck size={16}/>Privater Arbeitsplatz</span><span>5 kuratierte Designs</span></div></div>
      <section className="auth-card" aria-label="Geschützter Zugang">
        <div className="auth-lock"><LockKeyhole size={23}/></div><span className="auth-card-eyebrow">MICHAELS CV STUDIO</span><h2>Willkommen zurück.</h2><p>Dein persönlicher Arbeitsplatz ist geschützt.</p>
        {authenticated===null?<div className="auth-loading" role="status"><LoaderCircle className="spin" size={20}/>Zugang wird geprüft…</div>:<form onSubmit={event=>void login(event)}>
          <label htmlFor="editor-password">Passwort</label><div className="auth-password"><input id="editor-password" type={visible?'text':'password'} autoComplete="current-password" autoFocus value={password} onChange={event=>setPassword(event.target.value)} placeholder="Dein Passwort" required/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Passwort verbergen':'Passwort anzeigen'}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
          {error&&<div className="auth-error" role="alert">{error}</div>}<button className="auth-submit" type="submit" disabled={busy||!password}>{busy?<><LoaderCircle size={17} className="spin"/>Wird geöffnet…</>:<>Studio öffnen<ArrowRight size={17}/></>}</button>
        </form>}
        <div className="auth-private-note"><LockKeyhole size={12}/>Nur für dich. Deine Daten bleiben privat.</div>
      </section>
    </div><footer className="auth-footer"><span>MICHAEL MEIER</span><span>Deine Geschichte. Gut gestaltet.</span></footer>
  </main>;
}
