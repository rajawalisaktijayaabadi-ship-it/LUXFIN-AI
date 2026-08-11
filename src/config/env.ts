export const ENV = {
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  appUrl: import.meta.env.VITE_APP_URL || '',
};

export function checkEnvHealth(): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  return {
    ok: issues.length === 0,
    issues,
  };
}
