import { safeLink } from './model';

export type TextLink = { start: number; end: number; text: string; href: string; email: boolean };
export function textLinks(value: string): TextLink[] {
  const pattern = /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[a-z0-9.!#$%&*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}/gi;
  const result: TextLink[] = [];
  for (const match of value.matchAll(pattern)) {
    const start = match.index!;
    let text = match[0].replace(/[.,;:!?]+$/, '');
    while (/[)\]}]$/.test(text)) {
      const closing = text.at(-1)!;
      const opening = closing === ')' ? '(' : closing === ']' ? '[' : '{';
      if (text.split(closing).length <= text.split(opening).length) break;
      text = text.slice(0, -1);
    }
    if (!text || text.length > 2048) continue;
    const email = !/^https?:\/\/|^www\./i.test(text);
    const href = email ? `mailto:${text}` : safeLink(text);
    if (href) result.push({ start, end: start + text.length, text, href, email });
  }
  return result;
}
