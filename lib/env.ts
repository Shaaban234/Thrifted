// Centralized access to public env vars (bundled into the app at build time).

export const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL ?? "";
export const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD ?? "";

export function isAdminCredentials(email: string, password: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return false;
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}
