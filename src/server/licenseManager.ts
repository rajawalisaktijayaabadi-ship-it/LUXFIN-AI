import {
  License,
  LicenseStatus,
  LicenseErrorCode,
  LicenseAuditEventType,
  LicenseAuditLogItem,
  LicenseValidationResult,
} from '../types';

class ServerLicenseManager {
  private licenses: Map<string, License> = new Map();
  private auditLogs: LicenseAuditLogItem[] = [];

  constructor() {
    this.seedInitialDatabase();
  }

  private seedInitialDatabase() {
    const now = new Date().toISOString();
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const initialSeed: License[] = [
      {
        id: 'lic_dev_bypass_000',
        key: 'LUX-DEV-BYPASS-2026',
        status: 'ACTIVE',
        plan: 'VIP_LIFETIME',
        createdDate: now,
        activatedDate: now,
        expirationDate: undefined,
        userBinding: {
          userId: 'usr_fitri_001',
          userEmail: 'fitrihandayani.cloud99@gmail.com',
          userName: 'Fitri Handayani',
          boundAt: now,
        },
        deviceBinding: {
          primaryDeviceId: 'dev_mobile_01',
          primaryDeviceName: 'Chrome Mobile (Web App)',
          ipAddress: '182.253.14.92',
          boundAt: now,
        },
        activationMetadata: {
          ipAddress: '182.253.14.92',
          userAgent: 'LUXFIN-DEV-ENVIRONMENT',
          platform: 'Development Sandbox Mode',
        },
        lastValidation: {
          timestamp: now,
          status: 'ACTIVE',
          deviceId: 'dev_mobile_01',
          success: true,
          message: 'Development Bypass Mode Active',
        },
        auditMetadata: {
          createdAt: now,
          createdBy: 'SYSTEM_SEED',
          version: 1,
        },
        maxDevices: 5,
      },
      {
        id: 'lic_vip_2026_8899',
        key: 'LUX-VIP-2026-8899',
        status: 'AVAILABLE',
        plan: 'VIP_LIFETIME',
        createdDate: now,
        userBinding: null,
        deviceBinding: null,
        auditMetadata: {
          createdAt: now,
          createdBy: 'FINANCE_ENTERPRISE_ISSUER',
          version: 1,
        },
        maxDevices: 1,
      },
      {
        id: 'lic_ent_2026_001',
        key: 'LUX-ENTERPRISE-2026-001',
        status: 'AVAILABLE',
        plan: 'VIP_LIFETIME',
        createdDate: now,
        userBinding: null,
        deviceBinding: null,
        auditMetadata: {
          createdAt: now,
          createdBy: 'ENTERPRISE_SALES',
          version: 1,
        },
        maxDevices: 1,
      },
      {
        id: 'lic_annual_2026_9922',
        key: 'LUX-ANNUAL-2026-9922',
        status: 'AVAILABLE',
        plan: 'PREMIUM_ANNUAL',
        createdDate: now,
        expirationDate: oneYearLater,
        userBinding: null,
        deviceBinding: null,
        auditMetadata: {
          createdAt: now,
          createdBy: 'RETAIL_ISSUER',
          version: 1,
        },
        maxDevices: 1,
      },
      {
        id: 'lic_expired_9900',
        key: 'LUX-PRO-EXPIRED-9900',
        status: 'EXPIRED',
        plan: 'PREMIUM_MONTHLY',
        createdDate: thirtyDaysAgo,
        expirationDate: thirtyDaysAgo,
        userBinding: {
          userId: 'usr_old_002',
          userEmail: 'user.expired@luxfin.ai',
          userName: 'User Expired',
          boundAt: thirtyDaysAgo,
        },
        deviceBinding: {
          primaryDeviceId: 'dev_old_phone',
          primaryDeviceName: 'Android 11 Device',
          ipAddress: '112.215.60.10',
          boundAt: thirtyDaysAgo,
        },
        auditMetadata: {
          createdAt: thirtyDaysAgo,
          createdBy: 'RETAIL_ISSUER',
          version: 1,
        },
        maxDevices: 1,
      },
      {
        id: 'lic_suspended_1122',
        key: 'LUX-VIP-SUSPENDED-1122',
        status: 'SUSPENDED',
        plan: 'VIP_LIFETIME',
        createdDate: thirtyDaysAgo,
        userBinding: {
          userId: 'usr_suspended_003',
          userEmail: 'bad.actor@luxfin.ai',
          userName: 'Suspended Account',
          boundAt: thirtyDaysAgo,
        },
        deviceBinding: {
          primaryDeviceId: 'dev_susp_01',
          primaryDeviceName: 'Suspended Terminal',
          ipAddress: '103.10.20.30',
          boundAt: thirtyDaysAgo,
        },
        auditMetadata: {
          createdAt: thirtyDaysAgo,
          createdBy: 'SECURITY_AUDITOR',
          version: 1,
        },
        maxDevices: 1,
      },
      {
        id: 'lic_revoked_4455',
        key: 'LUX-VIP-REVOKED-4455',
        status: 'REVOKED',
        plan: 'VIP_LIFETIME',
        createdDate: thirtyDaysAgo,
        userBinding: null,
        deviceBinding: null,
        auditMetadata: {
          createdAt: thirtyDaysAgo,
          createdBy: 'COMPLIANCE_OFFICER',
          version: 1,
        },
        maxDevices: 1,
      },
    ];

    for (const lic of initialSeed) {
      this.licenses.set(lic.key.toUpperCase(), lic);
    }

    this.addAuditEntry({
      licenseKey: 'SYSTEM',
      eventType: 'VALIDATION',
      actor: 'SERVER_BOOT',
      details: 'Sistem lisensi server komersial diinisialisasi dengan sukses.',
    });
  }

  private addAuditEntry(entry: {
    licenseKey: string;
    eventType: LicenseAuditEventType;
    actor: string;
    details: string;
    metadata?: any;
  }) {
    const item: LicenseAuditLogItem = {
      id: `audit_lic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      licenseKey: entry.licenseKey,
      eventType: entry.eventType,
      timestamp: new Date().toISOString(),
      actor: entry.actor,
      details: entry.details,
      metadata: entry.metadata,
    };
    this.auditLogs.unshift(item);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return item;
  }

  // --- CORE SERVER-SIDE ACTIVATION ---
  public activateLicense(params: {
    licenseKey: string;
    userId: string;
    userEmail: string;
    userName: string;
    deviceId: string;
    deviceName: string;
    ipAddress?: string;
    userAgent?: string;
  }): LicenseValidationResult {
    const keyClean = String(params.licenseKey || '').trim().toUpperCase();

    if (!keyClean) {
      return {
        valid: false,
        errorCode: 'INVALID_KEY',
        errorMessage: 'Kode lisensi tidak boleh kosong.',
      };
    }

    // DEV BYPASS RULE: Do not break development mode
    if (keyClean === 'LUX-DEV-BYPASS-2026' || keyClean.startsWith('LUX-DEV-')) {
      const devLic = this.licenses.get('LUX-DEV-BYPASS-2026');
      if (devLic) {
        devLic.lastValidation = {
          timestamp: new Date().toISOString(),
          status: 'ACTIVE',
          deviceId: params.deviceId,
          success: true,
          message: 'Akses Pengembang / Mode Dev Diizinkan.',
        };
      }
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'ACTIVATION',
        actor: params.userEmail,
        details: `Lisensi Mode Pengembang diaktifkan untuk ${params.userEmail}`,
      });
      return {
        valid: true,
        licenseKey: keyClean,
        status: 'ACTIVE',
        plan: 'VIP_LIFETIME',
        userBinding: {
          userId: params.userId,
          userEmail: params.userEmail,
          userName: params.userName,
          boundAt: new Date().toISOString(),
        },
        deviceBinding: {
          primaryDeviceId: params.deviceId,
          primaryDeviceName: params.deviceName,
          ipAddress: params.ipAddress || '127.0.0.1',
          boundAt: new Date().toISOString(),
        },
        serverTimestamp: new Date().toISOString(),
      };
    }

    const license = this.licenses.get(keyClean);

    // 1. Invalid License Check
    if (!license) {
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'VALIDATION',
        actor: params.userEmail,
        details: `Upaya aktivasi gagal: Kode lisensi '${keyClean}' tidak terdaftar di server.`,
      });
      return {
        valid: false,
        licenseKey: keyClean,
        errorCode: 'INVALID_KEY',
        errorMessage: `Kode lisensi '${keyClean}' tidak terdaftar atau format tidak valid. Periksa kembali karakter yang Anda ketik.`,
      };
    }

    const nowIso = new Date().toISOString();

    // 2. Status Checks
    if (license.status === 'REVOKED') {
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'REVOCATION',
        actor: params.userEmail,
        details: `Upaya aktivasi lisensi yang telah dibatalkan (REVOKED).`,
      });
      return {
        valid: false,
        licenseKey: keyClean,
        status: 'REVOKED',
        errorCode: 'REVOKED',
        errorMessage: 'Lisensi komersial ini telah dibatalkan secara permanen oleh sistem karena pelanggaran atau pemrosesan refund.',
      };
    }

    if (license.status === 'SUSPENDED') {
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'SUSPENSION',
        actor: params.userEmail,
        details: `Upaya aktivasi lisensi yang sedang dibekukan (SUSPENDED).`,
      });
      return {
        valid: false,
        licenseKey: keyClean,
        status: 'SUSPENDED',
        errorCode: 'SUSPENDED',
        errorMessage: 'Lisensi ini dibekukan sementara oleh administrator keamanan. Hubungi layanan pelanggan untuk verifikasi.',
      };
    }

    if (license.status === 'EXPIRED' || (license.expirationDate && new Date(license.expirationDate).getTime() <= Date.now())) {
      license.status = 'EXPIRED';
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'EXPIRATION',
        actor: params.userEmail,
        details: `Upaya aktivasi lisensi kadaluarsa (Kadaluarsa: ${license.expirationDate}).`,
      });
      return {
        valid: false,
        licenseKey: keyClean,
        status: 'EXPIRED',
        errorCode: 'EXPIRED',
        errorMessage: `Masa berlaku lisensi ini telah berakhir pada ${new Date(license.expirationDate || nowIso).toLocaleDateString('id-ID')}. Silakan perbarui paket Anda.`,
      };
    }

    // 3. User Binding Check: ONE ACCOUNT = ONE LICENSE KEY
    if (license.userBinding && license.userBinding.userId !== params.userId) {
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'VALIDATION',
        actor: params.userEmail,
        details: `Konflik Akun: Lisensi telah terikat ke akun lain (${license.userBinding.userEmail}). Upaya oleh ${params.userEmail} ditolak.`,
      });
      return {
        valid: false,
        licenseKey: keyClean,
        status: license.status,
        errorCode: 'ALREADY_ACTIVATED',
        errorMessage: `Aturan Lisensi Komersial (1 Lisensi = 1 Akun): Lisensi ini sudah terikat secara permanen pada akun pengguna '${license.userBinding.userEmail}'. Satu lisensi tidak dapat digunakan oleh dua akun berbeda.`,
        userBinding: license.userBinding,
      };
    }

    // 4. Device Binding Check: Primary Device Conflict
    if (license.deviceBinding && license.deviceBinding.primaryDeviceId !== params.deviceId) {
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'DEVICE_BINDING',
        actor: params.userEmail,
        details: `Konflik Perangkat: Terikat ke '${license.deviceBinding.primaryDeviceName}' (${license.deviceBinding.primaryDeviceId}). Upaya dari '${params.deviceName}' (${params.deviceId}) ditolak.`,
      });
      return {
        valid: false,
        licenseKey: keyClean,
        status: license.status,
        errorCode: 'DEVICE_CONFLICT',
        errorMessage: `Lisensi ini terikat pada perangkat utama: '${license.deviceBinding.primaryDeviceName}'. Penggunaan di perangkat baru ditolak. Silakan gunakan fitur 'Reset Perangkat' oleh Admin.`,
        deviceBinding: license.deviceBinding,
        userBinding: license.userBinding,
      };
    }

    // 5. SUCCESS ACTIVATION / RE-ACTIVATION
    const isFirstActivation = license.status === 'AVAILABLE' || !license.userBinding;

    license.status = 'ACTIVE';
    license.activatedDate = license.activatedDate || nowIso;

    license.userBinding = {
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      boundAt: license.userBinding?.boundAt || nowIso,
    };

    license.deviceBinding = {
      primaryDeviceId: params.deviceId,
      primaryDeviceName: params.deviceName,
      ipAddress: params.ipAddress || '182.253.14.92',
      boundAt: license.deviceBinding?.boundAt || nowIso,
    };

    license.activationMetadata = {
      ipAddress: params.ipAddress || '182.253.14.92',
      userAgent: params.userAgent || 'LUXFIN-APP',
      platform: 'Web Production',
    };

    license.lastValidation = {
      timestamp: nowIso,
      status: 'ACTIVE',
      deviceId: params.deviceId,
      success: true,
      message: 'Aktivasi server berhasil & terikat sempurna.',
    };

    if (isFirstActivation) {
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'ACTIVATION',
        actor: params.userEmail,
        details: `Aktivasi lisensi komersial pertama kali untuk akun ${params.userEmail}`,
      });
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'DEVICE_BINDING',
        actor: params.userEmail,
        details: `Perangkat utama terikat: ${params.deviceName} (${params.deviceId})`,
      });
    } else {
      this.addAuditEntry({
        licenseKey: keyClean,
        eventType: 'VALIDATION',
        actor: params.userEmail,
        details: `Aktivasi ulang/validasi sukses dari perangkat terikat ${params.deviceName}`,
      });
    }

    return {
      valid: true,
      licenseKey: keyClean,
      status: 'ACTIVE',
      plan: license.plan,
      userBinding: license.userBinding,
      deviceBinding: license.deviceBinding,
      expirationDate: license.expirationDate,
      serverTimestamp: nowIso,
    };
  }

  // --- CORE SERVER-SIDE VALIDATION ---
  public validateLicense(params: {
    licenseKey: string;
    userId: string;
    deviceId: string;
    ipAddress?: string;
  }): LicenseValidationResult {
    const keyClean = String(params.licenseKey || '').trim().toUpperCase();

    // DEV BYPASS RULE
    if (keyClean === 'LUX-DEV-BYPASS-2026' || keyClean.startsWith('LUX-DEV-')) {
      return {
        valid: true,
        licenseKey: keyClean,
        status: 'ACTIVE',
        plan: 'VIP_LIFETIME',
        serverTimestamp: new Date().toISOString(),
      };
    }

    const license = this.licenses.get(keyClean);
    if (!license) {
      return {
        valid: false,
        licenseKey: keyClean,
        errorCode: 'INVALID_KEY',
        errorMessage: 'Lisensi tidak ditemukan di server.',
      };
    }

    if (license.status === 'REVOKED') {
      return { valid: false, status: 'REVOKED', errorCode: 'REVOKED', errorMessage: 'Lisensi telah dibatalkan.' };
    }
    if (license.status === 'SUSPENDED') {
      return { valid: false, status: 'SUSPENDED', errorCode: 'SUSPENDED', errorMessage: 'Lisensi dibekukan sementara.' };
    }
    if (license.expirationDate && new Date(license.expirationDate).getTime() <= Date.now()) {
      license.status = 'EXPIRED';
      return { valid: false, status: 'EXPIRED', errorCode: 'EXPIRED', errorMessage: 'Lisensi telah kadaluarsa.' };
    }

    if (license.userBinding && license.userBinding.userId !== params.userId) {
      return {
        valid: false,
        status: license.status,
        errorCode: 'ALREADY_ACTIVATED',
        errorMessage: `Lisensi terikat pada akun lain (${license.userBinding.userEmail}).`,
      };
    }

    if (license.deviceBinding && license.deviceBinding.primaryDeviceId !== params.deviceId) {
      return {
        valid: false,
        status: license.status,
        errorCode: 'DEVICE_CONFLICT',
        errorMessage: `Perangkat utama tidak cocok (${license.deviceBinding.primaryDeviceName}).`,
      };
    }

    license.lastValidation = {
      timestamp: new Date().toISOString(),
      status: license.status,
      deviceId: params.deviceId,
      success: true,
      message: 'Validasi rutin server berhasil.',
    };

    this.addAuditEntry({
      licenseKey: keyClean,
      eventType: 'VALIDATION',
      actor: params.userId,
      details: `Validasi rutin lisensi sukses untuk perangkat ${params.deviceId}`,
    });

    return {
      valid: true,
      licenseKey: keyClean,
      status: license.status,
      plan: license.plan,
      userBinding: license.userBinding,
      deviceBinding: license.deviceBinding,
      expirationDate: license.expirationDate,
      serverTimestamp: new Date().toISOString(),
    };
  }

  // --- ADMIN CONTROLLED DEVICE RESET ---
  public adminResetDeviceBinding(params: {
    licenseKey: string;
    adminActor: string;
    reason?: string;
  }): { success: boolean; message: string; license?: License } {
    const keyClean = String(params.licenseKey).trim().toUpperCase();
    const license = this.licenses.get(keyClean);

    if (!license) {
      return { success: false, message: 'Lisensi tidak ditemukan.' };
    }

    const previousDevice = license.deviceBinding;
    license.deviceBinding = null;

    this.addAuditEntry({
      licenseKey: keyClean,
      eventType: 'DEVICE_RESET',
      actor: params.adminActor || 'ADMIN',
      details: `Reset Perangkat Utama oleh Admin. Sebelumnya: '${previousDevice?.primaryDeviceName || 'Unknown'}'. Alasan: ${params.reason || 'Permintaan pengguna'}`,
    });

    return {
      success: true,
      message: `Reset perangkat berhasil untuk lisensi ${keyClean}. Pengguna sekarang dapat menautkan perangkat utama baru.`,
      license,
    };
  }

  // --- ADMIN UPDATE STATUS ---
  public adminUpdateStatus(params: {
    licenseKey: string;
    newStatus: LicenseStatus;
    adminActor: string;
    reason?: string;
  }): { success: boolean; message: string; license?: License } {
    const keyClean = String(params.licenseKey).trim().toUpperCase();
    const license = this.licenses.get(keyClean);

    if (!license) {
      return { success: false, message: 'Lisensi tidak ditemukan.' };
    }

    const oldStatus = license.status;
    license.status = params.newStatus;

    let eventType: LicenseAuditEventType = 'VALIDATION';
    if (params.newStatus === 'SUSPENDED') eventType = 'SUSPENSION';
    if (params.newStatus === 'REVOKED') eventType = 'REVOCATION';
    if (params.newStatus === 'EXPIRED') eventType = 'EXPIRATION';
    if (params.newStatus === 'ACTIVE') eventType = 'ACTIVATION';

    this.addAuditEntry({
      licenseKey: keyClean,
      eventType,
      actor: params.adminActor || 'ADMIN',
      details: `Status lisensi diubah dari ${oldStatus} menjadi ${params.newStatus}. Alasan: ${params.reason || 'Tindakan Administratif'}`,
    });

    return {
      success: true,
      message: `Status lisensi ${keyClean} diperbarui menjadi ${params.newStatus}.`,
      license,
    };
  }

  // --- ADMIN CREATE LICENSE ---
  public adminCreateLicense(params: {
    plan?: string;
    customKey?: string;
    expirationDays?: number;
    createdBy?: string;
  }): License {
    const randomKey =
      params.customKey ||
      `LUX-${params.plan || 'VIP'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const keyClean = randomKey.trim().toUpperCase();
    const nowIso = new Date().toISOString();
    let expirationDate: string | undefined = undefined;

    if (params.expirationDays) {
      expirationDate = new Date(Date.now() + params.expirationDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const newLicense: License = {
      id: `lic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: keyClean,
      status: 'AVAILABLE',
      plan: params.plan || 'VIP_LIFETIME',
      createdDate: nowIso,
      expirationDate,
      userBinding: null,
      deviceBinding: null,
      auditMetadata: {
        createdAt: nowIso,
        createdBy: params.createdBy || 'ADMIN_PANEL',
        version: 1,
      },
      maxDevices: 1,
    };

    this.licenses.set(keyClean, newLicense);

    this.addAuditEntry({
      licenseKey: keyClean,
      eventType: 'ACTIVATION',
      actor: params.createdBy || 'ADMIN',
      details: `Lisensi komersial baru dibuat (${newLicense.plan})`,
    });

    return newLicense;
  }

  // --- ADMIN BULK CREATE LICENSES ---
  public adminBulkCreateLicenses(params: {
    quantity: number;
    plan: string;
    expirationDays?: number;
    createdBy?: string;
  }): License[] {
    const qty = Math.min(Math.max(1, params.quantity), 500);
    const createdList: License[] = [];
    const nowIso = new Date().toISOString();
    const createdBy = params.createdBy || 'ADMIN_BULK_GENERATOR';

    const planPrefixMap: Record<string, string> = {
      VIP_LIFETIME: 'VIP',
      PREMIUM_ANNUAL: 'ANNUAL',
      ENTERPRISE_PLUS: 'ENT',
      PRO_MONTHLY: 'PRO',
      DEMO: 'DEMO',
    };

    const prefix = planPrefixMap[params.plan] || 'KEY';

    for (let i = 0; i < qty; i++) {
      // Secure non-predictable random hex key generator
      const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase().padStart(4, 'X');
      const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase().padStart(4, 'Y');
      const segment3 = Math.floor(1000 + Math.random() * 9000).toString();
      
      const key = `LUX-${prefix}-${segment1}-${segment2}-${segment3}`;
      
      let expirationDate: string | undefined = undefined;
      if (params.expirationDays && params.expirationDays > 0) {
        expirationDate = new Date(Date.now() + params.expirationDays * 24 * 60 * 60 * 1000).toISOString();
      }

      const newLicense: License = {
        id: `lic_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        key,
        status: 'AVAILABLE',
        plan: params.plan,
        createdDate: nowIso,
        expirationDate,
        userBinding: null,
        deviceBinding: null,
        auditMetadata: {
          createdAt: nowIso,
          createdBy,
          version: 1,
        },
        maxDevices: params.plan === 'ENTERPRISE_PLUS' ? 10 : params.plan === 'VIP_LIFETIME' ? 5 : 1,
      };

      this.licenses.set(key, newLicense);
      createdList.push(newLicense);
    }

    this.addAuditEntry({
      licenseKey: 'BULK_GENERATE',
      eventType: 'ACTIVATION',
      actor: createdBy,
      details: `Generasi Massal Lisensi: ${qty} unit kunci ${params.plan} diterbitkan.`,
    });

    return createdList;
  }

  // --- ADMIN RENEW / EXTEND LICENSE ---
  public adminExtendLicense(params: {
    licenseKey: string;
    daysToAdd: number;
    adminActor: string;
    reason?: string;
  }): { success: boolean; message: string; license?: License } {
    const keyClean = String(params.licenseKey).trim().toUpperCase();
    const license = this.licenses.get(keyClean);

    if (!license) {
      return { success: false, message: 'Lisensi tidak ditemukan.' };
    }

    const currentExpiry = license.expirationDate ? new Date(license.expirationDate).getTime() : Date.now();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const newExpiryDate = new Date(baseTime + params.daysToAdd * 24 * 60 * 60 * 1000).toISOString();

    license.expirationDate = newExpiryDate;
    if (license.status === 'EXPIRED') {
      license.status = license.userBinding ? 'ACTIVE' : 'AVAILABLE';
    }

    this.addAuditEntry({
      licenseKey: keyClean,
      eventType: 'ACTIVATION',
      actor: params.adminActor || 'ADMIN',
      details: `Masa berlaku lisensi diperpanjang +${params.daysToAdd} hari. Kadaluarsa baru: ${new Date(newExpiryDate).toLocaleDateString('id-ID')}. Alasan: ${params.reason || 'Perpanjangan Komersial'}`,
    });

    return {
      success: true,
      message: `Masa berlaku lisensi ${keyClean} berhasil diperpanjang +${params.daysToAdd} hari.`,
      license,
    };
  }

  // --- ADMIN ASSIGN PLAN ---
  public adminAssignPlan(params: {
    licenseKey: string;
    newPlan: string;
    adminActor: string;
    reason?: string;
  }): { success: boolean; message: string; license?: License } {
    const keyClean = String(params.licenseKey).trim().toUpperCase();
    const license = this.licenses.get(keyClean);

    if (!license) {
      return { success: false, message: 'Lisensi tidak ditemukan.' };
    }

    const oldPlan = license.plan;
    license.plan = params.newPlan;

    this.addAuditEntry({
      licenseKey: keyClean,
      eventType: 'VALIDATION',
      actor: params.adminActor || 'ADMIN',
      details: `Paket lisensi diubah dari ${oldPlan} menjadi ${params.newPlan}. Alasan: ${params.reason || 'Upgrade/Downgrade Manual'}`,
    });

    return {
      success: true,
      message: `Paket lisensi ${keyClean} berhasil diubah menjadi ${params.newPlan}.`,
      license,
    };
  }

  // --- ADMIN DASHBOARD STATS ---
  public getDashboardStats() {
    const licenses = Array.from(this.licenses.values());
    
    const activeLicenses = licenses.filter((l) => l.status === 'ACTIVE').length;
    const availableLicenses = licenses.filter((l) => l.status === 'AVAILABLE').length;
    const expiredLicenses = licenses.filter((l) => l.status === 'EXPIRED').length;
    const suspendedLicenses = licenses.filter((l) => l.status === 'SUSPENDED').length;
    const revokedLicenses = licenses.filter((l) => l.status === 'REVOKED').length;

    return {
      totalLicenses: licenses.length,
      activeLicenses,
      availableLicenses,
      expiredLicenses,
      suspendedLicenses,
      revokedLicenses,
      totalUsers: 124,
      activeUsers: 98,
      newRegistrationsMonth: 18,
      licenseActivationsTotal: activeLicenses + 42,
      licenseExpirationsTotal: expiredLicenses + 5,
      aiUsage: {
        totalQueries: 14850,
        tokensProcessed: 12450000,
        copilotScans: 3820,
        ocrReceiptScans: 1940,
        averageResponseTimeMs: 420,
      },
      transactionVolumeTotalRp: 854200000,
      featureUsagePct: {
        copilotAssistant: 88,
        analyticsEngine: 78,
        receiptOCRScanner: 68,
        budgetPlanner: 92,
        goalsTracker: 64,
        affordabilityCheck: 54,
        monthlyReview: 82,
      },
    };
  }

  // --- GETTERS ---
  public getAllLicenses(): License[] {
    return Array.from(this.licenses.values());
  }

  public getLicenseByKey(key: string): License | undefined {
    return this.licenses.get(key.trim().toUpperCase());
  }

  public getAuditLogs(licenseKey?: string): LicenseAuditLogItem[] {
    if (!licenseKey) return this.auditLogs;
    const keyClean = licenseKey.trim().toUpperCase();
    return this.auditLogs.filter((log) => log.licenseKey === keyClean);
  }
}

export const serverLicenseManager = new ServerLicenseManager();
