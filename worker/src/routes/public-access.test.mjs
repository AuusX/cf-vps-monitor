import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const publicSource = await readFile(new URL('./public.ts', import.meta.url), 'utf8');
const adminSource = await readFile(new URL('./admin.ts', import.meta.url), 'utf8');
const indexSource = await readFile(new URL('../index.ts', import.meta.url), 'utf8');

const statusRoute = publicSource.indexOf("publicRoutes.get('/access/status'");
const loginRoute = publicSource.indexOf("publicRoutes.post('/access/login'");
const publicClientsRoute = publicSource.indexOf("publicRoutes.get('/clients'");

assert.ok(statusRoute > 0 && loginRoute > statusRoute, 'public access endpoints must exist');
assert.ok(publicClientsRoute > loginRoute, 'public monitor routes must remain registered after access endpoints');
assert.doesNotMatch(publicSource, /publicRoutes\.use\('\*'/);
assert.match(publicSource, /hasConfiguredPublicAccess[^]*hasAdminSession\(c\)/);
assert.match(publicSource, /verifyPassword\(password, settings\.passwordHash\)/);

assert.match(indexSource, /requiresPublicMonitorAccess\(c\.req\.method/);
assert.match(indexSource, /app\.use\('\/api\/\*', requirePublicMonitorAccess\)/);

assert.match(adminSource, /public_access_password_hash/);
assert.match(adminSource, /delete scoped\.public_access_password_hash/);
assert.match(adminSource, /hashPassword\(publicAccessPassword\)/);
