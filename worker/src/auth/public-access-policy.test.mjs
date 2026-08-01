import assert from 'node:assert/strict';
import test from 'node:test';
import { requiresPublicMonitorAccess } from './public-access-policy.ts';

const protectedViewerPaths = [
  '/api/clients',
  '/api/public/bootstrap',
  '/api/recent/node-1',
  '/api/records/load',
  '/api/records/ping/batch',
  '/api/task/ping',
  '/api/websites',
  '/api/websites/1/checks',
  '/api/nodes',
  '/api/live',
  '/api/live/clients',
  '/api/ws/live-token',
  '/api/ws/live',
];

for (const pathname of protectedViewerPaths) {
  test(`protects viewer GET ${pathname}`, () => {
    assert.equal(requiresPublicMonitorAccess('GET', pathname), true);
  });
}

const agentPaths = [
  ['POST', '/api/clients/register'],
  ['GET', '/api/clients/policy'],
  ['POST', '/api/clients/uploadBasicInfo'],
  ['POST', '/api/clients/report'],
  ['GET', '/api/clients/ping/tasks'],
  ['POST', '/api/clients/ping/result'],
  ['GET', '/api/clients/report'],
];

for (const [method, pathname] of agentPaths) {
  test(`does not protect agent ${method} ${pathname}`, () => {
    assert.equal(requiresPublicMonitorAccess(method, pathname), false);
  });
}

test('does not protect access, admin, setup, theme or public settings endpoints', () => {
  assert.equal(requiresPublicMonitorAccess('GET', '/api/access/status'), false);
  assert.equal(requiresPublicMonitorAccess('POST', '/api/access/login'), false);
  assert.equal(requiresPublicMonitorAccess('GET', '/api/admin/clients'), false);
  assert.equal(requiresPublicMonitorAccess('POST', '/api/setup/database/init'), false);
  assert.equal(requiresPublicMonitorAccess('GET', '/api/theme/active.css'), false);
  assert.equal(requiresPublicMonitorAccess('GET', '/api/public'), false);
});

test('does not protect non-read methods on viewer paths', () => {
  assert.equal(requiresPublicMonitorAccess('POST', '/api/clients'), false);
  assert.equal(requiresPublicMonitorAccess('DELETE', '/api/websites/1'), false);
});
