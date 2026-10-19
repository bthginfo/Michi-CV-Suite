import { documentSchema, type CVDocument } from './model';

const MAX_BYTES = 2_500_000;
function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.append(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function fileName(name: string) {
  return name.normalize('NFKD').replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-') || 'Lebenslauf';
}
export function downloadBackup(doc: CVDocument) {
  saveFile(new Blob([JSON.stringify(doc,null,2)],{type:'application/json'}),`${fileName(doc.name)}-CV-Backup.json`);
}
export async function importBackup(file: File): Promise<CVDocument> {
  if (file.size > MAX_BYTES) throw new Error('Das Backup ist zu groß. Bitte eine Datei unter 2,5 MB verwenden.');
  try { return documentSchema.parse(JSON.parse(await file.text())); }
  catch { throw new Error('Diese Datei ist kein gültiges CV-Studio-Backup. Bitte eine exportierte JSON-Datei auswählen.'); }
}
export async function prepareImage(file: File): Promise<string> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Bitte ein JPG-, PNG- oder WebP-Bild auswählen.');
  if (file.size > 15_000_000) throw new Error('Das Bild ist zu groß. Bitte ein Bild unter 15 MB auswählen.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('Bild konnte nicht gelesen werden.');
    const scale = Math.min(1,960 / Math.max(image.naturalWidth,image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(image.naturalWidth*scale));
    canvas.height = Math.max(1,Math.round(image.naturalHeight*scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Dein Browser unterstützt den Bild-Upload nicht.');
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    let quality = 0.88;
    let result = canvas.toDataURL('image/webp',quality);
    while (result.length > 400000 && quality > 0.35) { quality -= 0.12; result = canvas.toDataURL('image/webp',quality); }
    if (result.length > 1400000) throw new Error('Dieses Bild ist zu komplex. Bitte ein kleineres Bild verwenden.');
    return result;
  } catch (error) {
    if (error instanceof Error && /zu komplex|unterstützt/.test(error.message)) throw error;
    throw new Error('Das Bild konnte nicht geöffnet werden. Bitte ein anderes JPG-, PNG- oder WebP-Bild auswählen.');
  } finally { URL.revokeObjectURL(url); }
}

/** Optional offline image-PDF export. The normal export below preserves selectable text. */
export async function exportRasterPDF(doc: CVDocument): Promise<void> {
  const [{toCanvas,getFontEmbedCSS},{jsPDF}] = await Promise.all([import('html-to-image'),import('jspdf')]);
  await document.fonts.ready;
  let pages = Array.from(document.querySelectorAll<HTMLElement>('.cv-page[data-export-page]'));
  if (!pages.length) pages = Array.from(document.querySelectorAll<HTMLElement>('.cv-page')).filter(page => page.getBoundingClientRect().width > 0 && !page.closest('[aria-hidden="true"]'));
  if (!pages.length) throw new Error('Die Vorschau wird noch aufgebaut. Bitte einen Moment warten und erneut versuchen.');
  const pdf = new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
  pdf.setProperties({title:`Lebenslauf · ${doc.name}`,subject:doc.title,author:doc.name,creator:'CV Studio'});
  const fontEmbedCSS = await getFontEmbedCSS(pages[0],{preferredFontFormat:'woff2'});
  const capturedLinks: {page:number,x:number,y:number,w:number,h:number,url:string}[] = [];
  for (const [index,page] of pages.entries()) {
    const rect = page.getBoundingClientRect();
    for (const anchor of page.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const href = anchor.getAttribute('href')??'';
      if (!/^(https?:|mailto:|tel:)/i.test(href)) continue;
      for (const box of anchor.getClientRects()) {
        const left = Math.max(0,(box.left-rect.left)/rect.width);
        const top = Math.max(0,(box.top-rect.top)/rect.height);
        const width = Math.min(box.width/rect.width,1-left);
        const height = Math.min(box.height/rect.height,1-top);
        if (width>0 && height>0) capturedLinks.push({page:index+1,x:left*210,y:top*297,w:width*210,h:height*297,url:href});
      }
    }
    const host = document.createElement('div');
    host.className = 'pdf-capture';
    host.style.cssText = 'position:fixed;left:-20000px;top:0;width:794px;pointer-events:none;z-index:-1;';
    const clone = page.cloneNode(true) as HTMLElement;
    clone.style.width = `${page.offsetWidth}px`; clone.style.height = `${page.offsetHeight}px`;
    clone.style.transform = 'none'; clone.style.margin = '0'; clone.style.boxShadow = 'none'; clone.style.borderRadius = '0';
    for (const node of clone.querySelectorAll('[data-editor-only]')) node.remove();
    for (const node of clone.querySelectorAll<HTMLElement>('[contenteditable]')) {
      node.removeAttribute('contenteditable'); node.style.outline='none'; node.style.boxShadow='none';
    }
    host.append(clone); document.body.append(host);
    try {
      const canvas = await toCanvas(clone,{width:page.offsetWidth,height:page.offsetHeight,pixelRatio:3,fontEmbedCSS,
        backgroundColor:'#ffffff',skipAutoScale:true,filter:node=> !(node instanceof HTMLElement && node.hasAttribute('data-editor-only'))});
      if (index>0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg',0.98),'JPEG',0,0,210,297,undefined,'FAST');
      canvas.width=0; canvas.height=0;
    } finally { host.remove(); }
  }
  for (const link of capturedLinks) { pdf.setPage(link.page);pdf.link(link.x,link.y,link.w,link.h,{url:link.url}); }
  pdf.save(`${fileName(doc.name)}-Lebenslauf.pdf`);
}

/** Print the exact canvas DOM, styles, embedded fonts and images with Chromium. */
export async function exportPDF(doc:CVDocument):Promise<void>{
  const {getFontEmbedCSS}=await import('html-to-image');
  await document.fonts.ready;
  await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
  const pages=Array.from(document.querySelectorAll<HTMLElement>('.cv-page')).filter(page=>page.getBoundingClientRect().width>0 && !page.closest('[aria-hidden="true"]'));
  if(!pages.length)throw new Error('Die Vorschau wird noch aufgebaut. Bitte einen Moment warten.');
  const fontCSS=await getFontEmbedCSS(pages[0],{preferredFontFormat:'woff2'});
  const css=Array.from(document.styleSheets).flatMap(sheet=>{
    try{return Array.from(sheet.cssRules).filter(rule=>rule.type!==CSSRule.FONT_FACE_RULE&&rule.type!==CSSRule.IMPORT_RULE).map(rule=>rule.cssText);}catch{return [];}
  }).join('\n');
  const sheets=pages.map(page=>{
    const clone=page.cloneNode(true) as HTMLElement;
    clone.classList.remove('canvas-editing');
    clone.style.transform='none';clone.style.animation='none';clone.style.opacity='1';
    // Preserve inherited typography at the page boundary as the editor shell is excluded.
    const computed=getComputedStyle(page);
    for(const property of ['font-family','font-size','font-weight','font-style','line-height','color','background-color'])clone.style.setProperty(property,computed.getPropertyValue(property));
    for(const element of clone.querySelectorAll('[data-editor-only]'))element.remove();
    for(const element of clone.querySelectorAll<HTMLElement>('[contenteditable],.is-editable')){
      element.removeAttribute('contenteditable');element.classList.remove('is-editable');element.style.outline='none';element.style.boxShadow='none';
    }
    for(const element of clone.querySelectorAll<HTMLElement>('.cv-photo.is-empty')){element.style.border='none';element.style.background='transparent';element.style.boxShadow='none';}
    for(const anchor of clone.querySelectorAll<HTMLAnchorElement>('a[href]')){
      if(!/^(https?:|mailto:|tel:)/i.test(anchor.getAttribute('href')??''))anchor.removeAttribute('href');
    }
    return `<div class="print-sheet">${clone.outerHTML}</div>`;
  }).join('');
  const escapedName=doc.name.replace(/[<>&"']/g,char=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[char]!));
  const printCSS=`@page{size:A4;margin:0}html,body{margin:0!important;padding:0!important;width:210mm!important;min-width:0!important;height:auto!important;overflow:visible!important;background:white!important}body{display:block!important}.print-sheet{width:210mm;height:297mm;position:relative;overflow:hidden;break-after:page;page-break-after:always;background:white}.print-sheet:last-child{break-after:auto;page-break-after:auto}.print-sheet>.cv-page{display:block!important;position:relative!important;flex:none!important;width:794px!important;height:1123px!important;min-height:1123px!important;max-height:1123px!important;margin:0!important;transform:scale(.9995723)!important;transform-origin:top left!important;border-radius:0!important;box-shadow:none!important;animation:none!important;opacity:1!important;break-after:auto!important;page-break-after:auto!important}*,*::before,*::after{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;animation:none!important;transition:none!important}[data-editor-only]{display:none!important}`;
  const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:"><title>Lebenslauf · ${escapedName}</title><style>${fontCSS}\n${css}\n${printCSS}</style></head><body>${sheets}</body></html>`;
  const shareId=new URLSearchParams(location.search).get('view');
  const response=await fetch('/api/pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({html,...(shareId?{shareId}:{})}),signal:AbortSignal.timeout(65000)});
  if(!response.ok){let message='Das PDF konnte gerade nicht erstellt werden. Bitte erneut versuchen.';try{const result=await response.json();if(typeof result.error==='string')message=result.error;}catch{/* Keep a safe, readable error. */}throw new Error(message);}
  const blob=await response.blob();
  if(!blob.type.includes('application/pdf'))throw new Error('Die PDF-Datei konnte nicht bestätigt werden. Bitte erneut versuchen.');
  saveFile(blob,`${fileName(doc.name)}-Lebenslauf.pdf`);
}
