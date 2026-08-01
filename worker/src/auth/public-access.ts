import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { Context } from 'hono';
import { sign, verify } from 'hono/jwt';
import { requireJwtSecret } from './jwt.ts';

const PUBLIC_ACCESS_COOKIE = 'cf_monitor_access';
const PUBLIC_ACCESS_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const encoder = new TextEncoder();

type PublicAccessEnv = {
  JWT_SECRET?: string;
};

function isHttpsRequest(c: Context): boolean {
  return new URL(c.req.url).protocol === 'https:';
}

async function passwordVersion(passwordHash: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(passwordHash)));
  return Array.from(digest.slice(0, 16), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getPublicAccessToken(c: Context): string | null {
  return getCookie(c, PUBLIC_ACCESS_COOKIE) ?? null;
}

export function setPublicAccessCookie(c: Context, token: string): void {
  setCookie(c, PUBLIC_ACCESS_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: isHttpsRequest(c),
    sameSite: 'Lax',
    maxAge: PUBLIC_ACCESS_MAX_AGE_SECONDS,
  });
}

export function clearPublicAccessCookie(c: Context): void {
  deleteCookie(c, PUBLIC_ACCESS_COOKIE, { path: '/' });
}

export async function createPublicAccessToken(passwordHash: string, env: PublicAccessEnv): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return sign({
    kind: 'public-access',
    passwordVersion: await passwordVersion(passwordHash),
    iat: now,
    exp: now + PUBLIC_ACCESS_MAX_AGE_SECONDS,
  }, requireJwtSecret(env), 'HS256');
}

export async function verifyPublicAccessToken(
  token: string,
  passwordHash: string,
  env: PublicAccessEnv,
): Promise<boolean> {
  try {
    const payload = await verify(token, requireJwtSecret(env), 'HS256');
    return payload?.kind === 'public-access' &&
      typeof payload.passwordVersion === 'string' &&
      payload.passwordVersion === await passwordVersion(passwordHash);
  } catch {
    return false;
  }
}
