import test from 'node:test';
import assert from 'node:assert/strict';
import {textLinks} from '../src/textLinks.ts';

test('CV text links retain exact text offsets and clickable web and email destinations',()=>{
  const value='Referenz: michi@example.com, Details unter www.example.com/projekt und https://example.org/cv?lang=de.';
  const links=textLinks(value);
  assert.deepEqual(links.map(link=>link.href),['mailto:michi@example.com','https://www.example.com/projekt','https://example.org/cv?lang=de']);
  for(const link of links) assert.equal(value.slice(link.start,link.end),link.text);
});

test('CV link punctuation preserves balanced URL brackets and excludes unsafe schemes and oversized URLs',()=>{
  const links=textLinks('Siehe (https://example.com/Artikel_(CV)). Oder https://example.org/demo!');
  assert.deepEqual(links.map(link=>link.text),['https://example.com/Artikel_(CV)','https://example.org/demo']);
  assert.deepEqual(textLinks('javascript:alert(1) data:text/html,test file:///private/test.pdf'),[]);
  assert.deepEqual(textLinks(`https://example.com/${'a'.repeat(2048)}`),[]);
});
