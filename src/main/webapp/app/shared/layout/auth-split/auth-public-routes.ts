export const AUTH_PUBLIC_PATHS = [
  '/login',
  '/logout',
  '/account/register',
  '/account/activate',
  '/account/reset/request',
  '/account/reset/finish',
] as const;

export type AuthPublicPath = typeof AUTH_PUBLIC_PATHS[number];

export function isAuthPublicRoute(pathname: string): boolean {
  return AUTH_PUBLIC_PATHS.some(p => pathname === p);
}
