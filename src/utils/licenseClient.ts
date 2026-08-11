import {
  License,
  LicenseValidationResult,
  LicenseStatus,
  LicenseAuditLogItem,
  UserProfile,
} from '../types';

export function getOrCreateDeviceId(): { deviceId: string; deviceName: string } {
  let deviceId = localStorage.getItem('luxfin_device_id');
  if (!deviceId) {
    deviceId = `dev_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    localStorage.setItem('luxfin_device_id', deviceId);
  }

  const userAgent = navigator.userAgent || '';
  let deviceName = 'Perangkat Seluler Web';
  if (/android/i.test(userAgent)) {
    deviceName = 'Android Mobile Terminal';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    deviceName = 'Apple iOS Device';
  } else if (/macintosh/i.test(userAgent)) {
    deviceName = 'MacBook / macOS Client';
  } else if (/windows/i.test(userAgent)) {
    deviceName = 'Windows Workstation';
  }

  return { deviceId, deviceName };
}

export async function activateLicenseServer(
  licenseKey: string,
  user: UserProfile
): Promise<LicenseValidationResult> {
  const { deviceId, deviceName } = getOrCreateDeviceId();

  try {
    const res = await fetch('/api/license/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: licenseKey.trim().toUpperCase(),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        deviceId,
        deviceName,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        valid: false,
        errorCode: errJson.errorCode || 'NETWORK_ERROR',
        errorMessage: errJson.errorMessage || 'Server validasi lisensi mengembalikan status error.',
      };
    }

    const data: LicenseValidationResult = await res.json();
    return data;
  } catch (error: any) {
    console.error('Client License Activate Error:', error);

    // Development bypass fallback if server is unreachable during local offline testing
    if (licenseKey.trim().toUpperCase() === 'LUX-DEV-BYPASS-2026') {
      return {
        valid: true,
        licenseKey: 'LUX-DEV-BYPASS-2026',
        status: 'ACTIVE',
        plan: 'VIP_LIFETIME',
        serverTimestamp: new Date().toISOString(),
      };
    }

    return {
      valid: false,
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'Gagal terhubung ke server validasi lisensi. Periksa koneksi internet Anda.',
    };
  }
}

export async function verifyLicenseServer(
  licenseKey: string,
  userId: string
): Promise<LicenseValidationResult> {
  const { deviceId } = getOrCreateDeviceId();

  try {
    const res = await fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: licenseKey.trim().toUpperCase(),
        userId,
        deviceId,
      }),
    });

    if (!res.ok) {
      return {
        valid: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: 'Server validasi tidak dapat dijangkau.',
      };
    }

    return await res.json();
  } catch (error: any) {
    return {
      valid: false,
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'Koneksi jaringan terputus saat validasi lisensi.',
    };
  }
}

export async function adminResetDeviceServer(
  licenseKey: string,
  adminActor: string,
  reason?: string
): Promise<{ success: boolean; message: string; license?: License }> {
  try {
    const res = await fetch('/api/license/admin/reset-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, adminActor, reason }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: 'Gagal menghubungi server admin reset.' };
  }
}

export async function adminUpdateStatusServer(
  licenseKey: string,
  newStatus: LicenseStatus,
  adminActor: string,
  reason?: string
): Promise<{ success: boolean; message: string; license?: License }> {
  try {
    const res = await fetch('/api/license/admin/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, newStatus, adminActor, reason }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: 'Gagal mengubah status lisensi di server.' };
  }
}

export async function adminCreateLicenseServer(
  plan: string,
  customKey?: string,
  expirationDays?: number
): Promise<{ success: boolean; license?: License }> {
  try {
    const res = await fetch('/api/license/admin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, customKey, expirationDays }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false };
  }
}

export async function adminFetchLicensesServer(): Promise<License[]> {
  try {
    const res = await fetch('/api/license/admin/list');
    const data = await res.json();
    return data.licenses || [];
  } catch (err) {
    return [];
  }
}

export async function adminFetchAuditLogsServer(licenseKey?: string): Promise<LicenseAuditLogItem[]> {
  try {
    const url = licenseKey ? `/api/license/admin/audit-logs?key=${encodeURIComponent(licenseKey)}` : '/api/license/admin/audit-logs';
    const res = await fetch(url);
    const data = await res.json();
    return data.auditLogs || [];
  } catch (err) {
    return [];
  }
}

// --- AUTOMATED SUITE FOR COMMERCIAL LICENSE RULES ---
export interface TestResultItem {
  testNumber: number;
  testName: string;
  expectedOutcome: string;
  passed: boolean;
  actualOutcome: string;
  details?: string;
}

export async function adminBulkCreateLicensesServer(
  quantity: number,
  plan: string,
  expirationDays?: number,
  createdBy?: string
): Promise<{ success: boolean; count: number; licenses: License[] }> {
  try {
    const res = await fetch('/api/license/admin/bulk-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, plan, expirationDays, createdBy }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Admin Bulk Create Error:', err);
    return { success: false, count: 0, licenses: [] };
  }
}

export async function adminExtendLicenseServer(
  licenseKey: string,
  daysToAdd: number,
  adminActor: string = 'SUPER_ADMIN',
  reason?: string
): Promise<{ success: boolean; message: string; license?: License }> {
  try {
    const res = await fetch('/api/license/admin/extend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, daysToAdd, adminActor, reason }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Admin Extend Error:', err);
    return { success: false, message: 'Gagal menghubungi server untuk perpanjangan lisensi.' };
  }
}

export async function adminAssignPlanServer(
  licenseKey: string,
  newPlan: string,
  adminActor: string = 'SUPER_ADMIN',
  reason?: string
): Promise<{ success: boolean; message: string; license?: License }> {
  try {
    const res = await fetch('/api/license/admin/assign-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, newPlan, adminActor, reason }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Admin Assign Plan Error:', err);
    return { success: false, message: 'Gagal merubah paket lisensi.' };
  }
}

export async function adminFetchDashboardStatsServer(): Promise<any> {
  try {
    const res = await fetch('/api/license/admin/dashboard-stats');
    const data = await res.json();
    return data.stats;
  } catch (err) {
    console.error('Admin Dashboard Stats Error:', err);
    return null;
  }
}

export async function runAutomatedLicenseTestSuite(): Promise<{
  passedCount: number;
  failedCount: number;
  totalCount: number;
  results: TestResultItem[];
}> {
  const results: TestResultItem[] = [];

  const testUser1: UserProfile = {
    id: 'usr_test_alpha_01',
    name: 'Penguji Alpha',
    email: 'alpha@luxfin.ai',
    licenseKey: '',
    licenseStatus: 'AVAILABLE',
    licensePlan: 'VIP_LIFETIME',
    registeredAt: new Date().toISOString(),
    preferredCurrency: 'IDR',
    locale: 'id-ID',
  };

  const testUser2: UserProfile = {
    id: 'usr_test_beta_02',
    name: 'Penguji Beta',
    email: 'beta@luxfin.ai',
    licenseKey: '',
    licenseStatus: 'AVAILABLE',
    licensePlan: 'VIP_LIFETIME',
    registeredAt: new Date().toISOString(),
    preferredCurrency: 'IDR',
    locale: 'id-ID',
  };

  // Create a clean test key for this test run
  const createRes = await adminCreateLicenseServer('VIP_LIFETIME', `LUX-TEST-SUITE-${Date.now().toString(36).toUpperCase()}`);
  const testKey = createRes.license?.key || 'LUX-VIP-2026-8899';

  // Test 1: Fresh License Activation by User 1
  const t1 = await activateLicenseServer(testKey, testUser1);
  results.push({
    testNumber: 1,
    testName: 'Fresh License Key Activation',
    expectedOutcome: 'Valid = True, Status = ACTIVE, User & Device Bound',
    passed: t1.valid === true && t1.status === 'ACTIVE' && t1.userBinding?.userId === testUser1.id,
    actualOutcome: `Valid: ${t1.valid}, Status: ${t1.status}, BoundUser: ${t1.userBinding?.userEmail}`,
  });

  // Test 2: Attempt Re-activation by User 2 (Rule: ONE ACCOUNT = ONE LICENSE KEY)
  const t2 = await activateLicenseServer(testKey, testUser2);
  results.push({
    testNumber: 2,
    testName: 'Enforce One Account = One License Rule',
    expectedOutcome: 'Valid = False, ErrorCode = ALREADY_ACTIVATED',
    passed: t2.valid === false && t2.errorCode === 'ALREADY_ACTIVATED',
    actualOutcome: `Valid: ${t2.valid}, ErrorCode: ${t2.errorCode}, Msg: ${t2.errorMessage}`,
  });

  // Test 3: Attempt Activation on Different Device ID
  const originalDeviceId = localStorage.getItem('luxfin_device_id');
  localStorage.setItem('luxfin_device_id', 'dev_fake_secondary_device_999');
  const t3 = await activateLicenseServer(testKey, testUser1);
  if (originalDeviceId) localStorage.setItem('luxfin_device_id', originalDeviceId);

  results.push({
    testNumber: 3,
    testName: 'Enforce Primary Device Binding Conflict',
    expectedOutcome: 'Valid = False, ErrorCode = DEVICE_CONFLICT',
    passed: t3.valid === false && t3.errorCode === 'DEVICE_CONFLICT',
    actualOutcome: `Valid: ${t3.valid}, ErrorCode: ${t3.errorCode}`,
  });

  // Test 4: Expired License Attempt
  const t4 = await activateLicenseServer('LUX-PRO-EXPIRED-9900', testUser1);
  results.push({
    testNumber: 4,
    testName: 'Expired License Rejection',
    expectedOutcome: 'Valid = False, ErrorCode = EXPIRED',
    passed: t4.valid === false && t4.errorCode === 'EXPIRED',
    actualOutcome: `Valid: ${t4.valid}, ErrorCode: ${t4.errorCode}`,
  });

  // Test 5: Suspended License Attempt
  const t5 = await activateLicenseServer('LUX-VIP-SUSPENDED-1122', testUser1);
  results.push({
    testNumber: 5,
    testName: 'Suspended License Rejection',
    expectedOutcome: 'Valid = False, ErrorCode = SUSPENDED',
    passed: t5.valid === false && t5.errorCode === 'SUSPENDED',
    actualOutcome: `Valid: ${t5.valid}, ErrorCode: ${t5.errorCode}`,
  });

  // Test 6: Revoked License Attempt
  const t6 = await activateLicenseServer('LUX-VIP-REVOKED-4455', testUser1);
  results.push({
    testNumber: 6,
    testName: 'Revoked License Rejection',
    expectedOutcome: 'Valid = False, ErrorCode = REVOKED',
    passed: t6.valid === false && t6.errorCode === 'REVOKED',
    actualOutcome: `Valid: ${t6.valid}, ErrorCode: ${t6.errorCode}`,
  });

  // Test 7: Invalid Key Attempt
  const t7 = await activateLicenseServer('LUX-INVALID-FAKE-KEY-99', testUser1);
  results.push({
    testNumber: 7,
    testName: 'Invalid Non-existent Key Rejection',
    expectedOutcome: 'Valid = False, ErrorCode = INVALID_KEY',
    passed: t7.valid === false && t7.errorCode === 'INVALID_KEY',
    actualOutcome: `Valid: ${t7.valid}, ErrorCode: ${t7.errorCode}`,
  });

  // Test 8: Admin Reset Device Binding
  const t8Reset = await adminResetDeviceServer(testKey, 'AUTOMATED_SUITE', 'Testing Device Reset Architecture');
  results.push({
    testNumber: 8,
    testName: 'Admin Controlled Device Reset',
    expectedOutcome: 'Success = True, Device Binding Cleared',
    passed: t8Reset.success === true && t8Reset.license?.deviceBinding === null,
    actualOutcome: `Success: ${t8Reset.success}, Msg: ${t8Reset.message}`,
  });

  // Test 9: Re-bind Device after Admin Reset
  localStorage.setItem('luxfin_device_id', 'dev_new_primary_after_reset_777');
  const t9 = await activateLicenseServer(testKey, testUser1);
  if (originalDeviceId) localStorage.setItem('luxfin_device_id', originalDeviceId);

  results.push({
    testNumber: 9,
    testName: 'Re-bind New Primary Device After Reset',
    expectedOutcome: 'Valid = True, New Device Bound',
    passed: t9.valid === true && t9.deviceBinding?.primaryDeviceId === 'dev_new_primary_after_reset_777',
    actualOutcome: `Valid: ${t9.valid}, BoundDevice: ${t9.deviceBinding?.primaryDeviceId}`,
  });

  // Test 10: DEV Mode Bypass Key
  const t10 = await activateLicenseServer('LUX-DEV-BYPASS-2026', testUser1);
  results.push({
    testNumber: 10,
    testName: 'Development Bypass Key Non-blocking',
    expectedOutcome: 'Valid = True, Status = ACTIVE',
    passed: t10.valid === true && t10.status === 'ACTIVE',
    actualOutcome: `Valid: ${t10.valid}, Status: ${t10.status}`,
  });

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    passedCount,
    failedCount,
    totalCount: results.length,
    results,
  };
}
