const PUBLIC_MONITOR_EXACT_PATHS = new Set([
  '/api/clients',
  '/api/public/bootstrap',
  '/api/task/ping',
  '/api/websites',
  '/api/nodes',
  '/api/live',
  '/api/live/clients',
  '/api/ws/live',
  '/api/ws/live-token',
]);

const PUBLIC_MONITOR_PATH_PREFIXES = [
  '/api/recent/',
  '/api/records/',
  '/api/websites/',
];

export function requiresPublicMonitorAccess(method: string, pathname: string): boolean {
  const normalizedMethod = method.toUpperCase();
  if (normalizedMethod !== 'GET' && normalizedMethod !== 'HEAD') return false;
  if (PUBLIC_MONITOR_EXACT_PATHS.has(pathname)) return true;
  return PUBLIC_MONITOR_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix));
}
