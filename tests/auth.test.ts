import test from 'node:test';
import assert from 'node:assert/strict';
import {hasEditorSession,passwordMatches,sessionCookie,clearSessionCookie} from '../server/auth.ts';

process.env.BLOB_READ_WRITE_TOKEN='unit-test-only-not-a-live-credential';
process.env.SESSION_SECRET='unit-test-only-session-signing-key';
process.env.EDITOR_PASSWORD='unit-test-only-password';
test('password checks validate the secret and reject wrong or oversized inputs',()=>{
  assert.equal(passwordMatches('unit-test-only-password'),true);
  assert.equal(passwordMatches('wrong'),false);
  assert.equal(passwordMatches('x'.repeat(257)),false);
});
test('editor cookies are HttpOnly/SameSite, signed and bounded to a week',()=>{
  const setCookie=sessionCookie(true);
  assert.match(setCookie,/HttpOnly/);assert.match(setCookie,/SameSite=Strict/);assert.match(setCookie,/; Secure/);
  const cookie=setCookie.split(';')[0];
  assert.equal(hasEditorSession({headers:{cookie}}),true);
  assert.equal(hasEditorSession({headers:{cookie:`${cookie.slice(0,-1)}!`}}),false);
  assert.equal(hasEditorSession({headers:{cookie:'michi_editor=1.invalid.invalid'}}),false);
  assert.equal(hasEditorSession({headers:{}}),false);
});
test('changing the password invalidates previously signed sessions',()=>{
  const cookie=sessionCookie(false).split(';')[0];
  const previous=process.env.EDITOR_PASSWORD;
  process.env.EDITOR_PASSWORD='new-unit-test-password';
  assert.equal(hasEditorSession({headers:{cookie}}),false);
  process.env.EDITOR_PASSWORD=previous;
  assert.match(clearSessionCookie(true),/Max-Age=0/);
});
