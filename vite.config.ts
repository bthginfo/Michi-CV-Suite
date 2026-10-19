import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { VercelRequest, VercelResponse } from '@vercel/node';
export default defineConfig(({mode})=>({
  plugins:[react(),{name:'local-workspace-api',configureServer(server){
    Object.assign(process.env,loadEnv(mode,process.cwd(),''));
    server.middlewares.use('/api',async(req,res,next)=>{
      const route=(req.url??'').split('?')[0];
      if(!['/workspace','/auth','/pdf'].includes(route)){next();return;}
      const chunks:Buffer[]=[];let size=0;
      try {
        for await(const chunk of req){const data=Buffer.from(chunk);size+=data.length;if(size>(route==='/pdf'?4_000_000:2_500_000)){res.statusCode=413;res.end(JSON.stringify({error:'Die Anfrage ist zu groß.'}));return;}chunks.push(data);}
        const url=new URL(req.url??'/',`http://${req.headers.host}`);
        const body=Buffer.concat(chunks).toString('utf8');
        Object.assign(req,{body,query:Object.fromEntries(url.searchParams)});
        const apiRes=res as unknown as VercelResponse;
        apiRes.status=(code:number)=>{res.statusCode=code;return apiRes;};
        apiRes.json=(value:unknown)=>{res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));return apiRes;};
        const api=await server.ssrLoadModule(`/api${route}.ts`);
        await api.default(req as unknown as VercelRequest,apiRes);
      }catch{res.statusCode=500;res.end(JSON.stringify({error:'Der lokale Cloud-Zugang konnte nicht gestartet werden.'}));}
    });
  }}],build:{chunkSizeWarningLimit:800},server:{port:5173}
}));
