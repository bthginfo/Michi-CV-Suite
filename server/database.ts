import {neon} from '@neondatabase/serverless';
import {get,BlobNotFoundError} from '@vercel/blob';
import {randomUUID} from 'node:crypto';
import {initialDocument} from '../src/seed.js';
import {documentSchema,type CVDocument} from '../src/model.js';

export type StoredDocument={document:CVDocument;etag:string;savedAt:string;pristine:boolean};
export const documentId=()=>process.env.CV_DOCUMENT_ID??'michael';
export function sqlClient(direct=false){
  const url=(direct&&process.env.DATABASE_URL_UNPOOLED)||process.env.DATABASE_URL;
  if(!url)throw new Error('Database is not configured.');
  return neon(url,{fetchOptions:{signal:AbortSignal.timeout(20000)}});
}
function stored(row:Record<string,unknown>):StoredDocument{
  return {document:documentSchema.parse(row.document),etag:String(row.etag),savedAt:new Date(String(row.saved_at)).toISOString(),pristine:row.pristine===true};
}
export async function readCurrent(id=documentId()):Promise<StoredDocument>{
  const sql=sqlClient();
  let rows=await sql`SELECT document,etag,saved_at,pristine FROM cv_documents WHERE id=${id}`;
  if(!rows.length)rows=await sql`INSERT INTO cv_documents(id,document,etag,pristine) VALUES(${id},${JSON.stringify(initialDocument)}::jsonb,${randomUUID()}::uuid,true) ON CONFLICT(id) DO UPDATE SET id=EXCLUDED.id RETURNING document,etag,saved_at,pristine`;
  return stored(rows[0]);
}
export async function saveCurrent(document:CVDocument,etag:string,migrateOnly=false,id=documentId()):Promise<StoredDocument|null>{
  const sql=sqlClient();
  const rows=await sql`UPDATE cv_documents SET document=${JSON.stringify(document)}::jsonb,etag=${randomUUID()}::uuid,saved_at=now(),pristine=false WHERE id=${id} AND etag=${etag}::uuid AND (${!migrateOnly} OR pristine=true) RETURNING document,etag,saved_at,pristine`;
  return rows.length?stored(rows[0]):null;
}
export async function createShare(etag:string,id=documentId()):Promise<string|null>{
  const sql=sqlClient();
  const rows=await sql`INSERT INTO cv_shares(id,document,source_id) SELECT ${randomUUID()}::uuid,document,id FROM cv_documents WHERE id=${id} AND etag=${etag}::uuid RETURNING id`;
  return rows.length?String(rows[0].id):null;
}
export async function readShare(id:string):Promise<{document:CVDocument;savedAt:string}|null>{
  const sql=sqlClient();
  const rows=await sql`SELECT document,created_at FROM cv_shares WHERE id=${id}::uuid`;
  if(rows.length)return {document:documentSchema.parse(rows[0].document),savedAt:new Date(String(rows[0].created_at)).toISOString()};
  // Public links made before the database migration keep working.
  if(!process.env.BLOB_READ_WRITE_TOKEN)return null;
  try{
    const legacy=await get(`shares/${id}.json`,{access:'private',useCache:false});
    if(!legacy||legacy.statusCode!==200||!legacy.stream)return null;
    const result=JSON.parse(await new Response(legacy.stream).text());
    return {document:documentSchema.parse(result.document),savedAt:String(result.savedAt)};
  }catch(error){if(error instanceof BlobNotFoundError)return null;throw error;}
}
export async function shareExists(id:string):Promise<boolean>{
  const sql=sqlClient();
  const rows=await sql`SELECT id FROM cv_shares WHERE id=${id}::uuid`;
  if(rows.length)return true;
  if(!process.env.BLOB_READ_WRITE_TOKEN)return false;
  try{
    const legacy=await get(`shares/${id}.json`,{access:'private'});
    if(!legacy)return false;
    await legacy.stream?.cancel();return true;
  }catch(error){if(error instanceof BlobNotFoundError)return false;throw error;}
}
