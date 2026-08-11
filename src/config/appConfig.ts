export const APP_CONFIG = {
  name: 'LUXFIN AI',
  version: '1.0.0',
  description: 'Operating System Keuangan Pribadi AI Berbasis Komersial',
  currency: {
    code: 'IDR',
    symbol: 'Rp',
    locale: 'id-ID',
  },
  timezone: 'Asia/Jakarta',
  defaultEmergencyFundTargetMonths: 6,
  licenseTiers: {
    DEMO: { maxDevices: 1, aiLimitPerDay: 5, features: ['BASIC_TRACKING'] },
    PREMIUM_MONTHLY: { maxDevices: 2, aiLimitPerDay: 50, features: ['ALL_FEATURES'] },
    PREMIUM_ANNUAL: { maxDevices: 3, aiLimitPerDay: 200, features: ['ALL_FEATURES', 'EXECUTIVE_REPORTS'] },
    VIP_LIFETIME: { maxDevices: 5, aiLimitPerDay: 9999, features: ['ALL_FEATURES', 'EXECUTIVE_REPORTS', 'PRIORITY_AI'] },
  },
  storageKeys: {
    state: 'luxfin_state_v1',
    theme: 'luxfin_theme_v1',
    session: 'luxfin_session_v1',
  },
} as const;
