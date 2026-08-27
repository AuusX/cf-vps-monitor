import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const liveDataContext = await readFile(new URL('./LiveDataContext.tsx', import.meta.url), 'utf8');
const livePolling = await readFile(new URL('./livePolling.ts', import.meta.url), 'utf8');
const publicIndex = await readFile(new URL('../pages/Index.tsx', import.meta.url), 'utf8');
const adminDashboard = await readFile(new URL('../pages/admin/Dashboard.tsx', import.meta.url), 'utf8');
const liveDataDurableObject = await readFile(
  new URL('../../../worker/src/do/live-data.ts', import.meta.url),
  'utf8',
);

assert.match(
  liveDataContext,
  /if \(isViewerExpiredMessage\(message\)\) \{\s*clearInitialSnapshotTimeout\(\);\s*expireViewerSession\(\);/,
);
assert.doesNotMatch(liveDataContext, /reconnectLiveWebSocket/);
assert.match(livePolling, /return currentExpiresAt \?\? now \+ config\.activeMaxDurationMs;/);

assert.doesNotMatch(publicIndex, /setInterval\(loadWhenVisible,\s*60_000\)/);
assert.doesNotMatch(adminDashboard, /setInterval\([\s\S]{0,100}loadClients\(\)[\s\S]{0,100}60_000/);

const policyCallCount = [...liveDataDurableObject.matchAll(/sendCurrentPolicyToAgent\(/g)].length;
assert.equal(policyCallCount, 2, '策略只应在方法定义和 Agent 建连时出现');
