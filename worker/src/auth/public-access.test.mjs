import assert from 'node:assert/strict';
import test from 'node:test';
import { createPublicAccessToken, verifyPublicAccessToken } from './public-access.ts';

const env = { JWT_SECRET: 'test-public-access-secret-at-least-32-bytes' };
const passwordHash = 'pbkdf2_sha256$10000$c2FsdC1ieXRlcy1mb3ItdGVzdA==$aGFzaC1ieXRlcy1mb3ItdGVzdC1vbmx5';

test('accepts a valid public access token', async () => {
  const token = await createPublicAccessToken(passwordHash, env);
  assert.equal(await verifyPublicAccessToken(token, passwordHash, env), true);
});

test('rejects a token after the access password changes', async () => {
  const token = await createPublicAccessToken(passwordHash, env);
  assert.equal(await verifyPublicAccessToken(token, `${passwordHash}-changed`, env), false);
});

test('rejects a tampered public access token', async () => {
  const token = await createPublicAccessToken(passwordHash, env);
  const replacement = token.endsWith('a') ? 'b' : 'a';
  const tampered = `${token.slice(0, -1)}${replacement}`;
  assert.equal(await verifyPublicAccessToken(tampered, passwordHash, env), false);
});
