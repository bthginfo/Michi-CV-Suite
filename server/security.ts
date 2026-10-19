import { createHash } from 'node:crypto';
export const MAX_DOCUMENT_BYTES = 2_500_000;
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function parseCredential(value: string | undefined): {id:string;secret:string} | null {
  const match = /^Bearer ([0-9a-f-]{36})\.([a-zA-Z0-9_-]{43})$/.exec(value??'');
  if (!match || !uuidPattern.test(match[1])) return null;
  return {id:match[1].toLowerCase(),secret:match[2]};
}
export function documentPath(credential:{id:string;secret:string}) {
  return `workspaces/${credential.id}/${createHash('sha256').update(credential.secret).digest('hex')}.json`;
}
export function isSameOrigin(origin:string|undefined,host:string|undefined):boolean {
  if (!origin) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}
