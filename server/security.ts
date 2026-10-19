export const MAX_DOCUMENT_BYTES = 2_500_000;
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isSameOrigin(origin:string|undefined,host:string|undefined):boolean {
  if (!origin) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}
