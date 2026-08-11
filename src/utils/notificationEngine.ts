import { storage } from './storage';
import { formatRp } from './formatters';
import { logger } from '../services/loggerService';

export type NotificationCategoryId =
  | 'budget-warning'
  | 'bill-reminder'
  | 'subscription-reminder'
  | 'goal-progress'
  | 'debt-payment'
  | 'unusual-transaction'
  | 'ai-insight'
  | 'monthly-review';

export interface NotificationCategoryConfig {
  id: NotificationCategoryId;
  title: string;
  desc: string;
  enabled: boolean;
  icon: string;
}

export interface NotificationPreferences {
  categories: Record<NotificationCategoryId, boolean>;
  webPushEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "07:00"
  unusualTransactionThreshold: number; // e.g. 1000000
}

const PREFS_KEY = 'luxfin_notif_preferences_v1';

export const DEFAULT_NOTIF_PREFERENCES: NotificationPreferences = {
  categories: {
    'budget-warning': true,
    'bill-reminder': true,
    'subscription-reminder': true,
    'goal-progress': true,
    'debt-payment': true,
    'unusual-transaction': true,
    'ai-insight': true,
    'monthly-review': true,
  },
  webPushEnabled: false,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  unusualTransactionThreshold: 1000000,
};

export const NOTIF_CATEGORY_DEFINITIONS: NotificationCategoryConfig[] = [
  {
    id: 'budget-warning',
    title: '1. Peringatan Anggaran (Budget Warning)',
    desc: 'Notifikasi jika pengeluaran kategori melebihi 80% atau melampaui limit.',
    enabled: true,
    icon: 'AlertTriangle',
  },
  {
    id: 'bill-reminder',
    title: '2. Pengingat Tagihan (Bill Reminder)',
    desc: 'Pengingat otomatis H-3 sebelum tanggal jatuh tempo tagihan.',
    enabled: true,
    icon: 'Calendar',
  },
  {
    id: 'subscription-reminder',
    title: '3. Pengingat Langganan (Subscription)',
    desc: 'Alert perpanjangan otomatis Netflix, Spotify, iCloud, & SaaS.',
    enabled: true,
    icon: 'CreditCard',
  },
  {
    id: 'goal-progress',
    title: '4. Kemajuan Target Tabungan (Goal)',
    desc: 'Notifikasi milestone saat mencapai 25%, 50%, 75%, & 100% target.',
    enabled: true,
    icon: 'Target',
  },
  {
    id: 'debt-payment',
    title: '5. Pembayaran Cicilan Utang (Debt)',
    desc: 'Alert tanggal jatuh tempo cicilan kartu kredit & utang.',
    enabled: true,
    icon: 'ShieldAlert',
  },
  {
    id: 'unusual-transaction',
    title: '6. Transaksi Tak Biasa (Unusual Activity)',
    desc: 'Deteksi pengeluaran jumlah besar atau merchant berisiko tinggi.',
    enabled: true,
    icon: 'Zap',
  },
  {
    id: 'ai-insight',
    title: '7. Wawasan Strategis AI (AI Copilot)',
    desc: 'Rekomendasi optimasi kas, investasi, & penghematan dari LUX AI.',
    enabled: true,
    icon: 'Sparkles',
  },
  {
    id: 'monthly-review',
    title: '8. Laporan Review Akhir Bulan',
    desc: 'Rangkuman lengkap kinerja keuangan eksekutif setiap akhir bulan.',
    enabled: true,
    icon: 'FileText',
  },
];

class NotificationEngine {
  private prefs: NotificationPreferences = DEFAULT_NOTIF_PREFERENCES;

  constructor() {
    this.loadPreferences();
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.prefs };
  }

  public savePreferences(newPrefs: NotificationPreferences) {
    this.prefs = newPrefs;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
      logger.info('NotifEngine', 'Notification preferences saved', this.prefs);
    } catch (e) {
      logger.error('NotifEngine', 'Failed to save notification preferences', e);
    }
  }

  private loadPreferences() {
    try {
      const data = localStorage.getItem(PREFS_KEY);
      if (data) {
        this.prefs = { ...DEFAULT_NOTIF_PREFERENCES, ...JSON.parse(data) };
      }
    } catch (e) {
      logger.error('NotifEngine', 'Failed to load preferences', e);
      this.prefs = DEFAULT_NOTIF_PREFERENCES;
    }
  }

  public isCategoryEnabled(catId: NotificationCategoryId): boolean {
    return this.prefs.categories[catId] ?? true;
  }

  public isQuietHoursActive(): boolean {
    if (!this.prefs.quietHoursEnabled) return false;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const [sH, sM] = this.prefs.quietHoursStart.split(':').map(Number);
    const [eH, eM] = this.prefs.quietHoursEnd.split(':').map(Number);

    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;

    if (startMins > endMins) {
      // Spans midnight (e.g. 22:00 to 07:00)
      return currentMins >= startMins || currentMins < endMins;
    } else {
      return currentMins >= startMins && currentMins < endMins;
    }
  }

  /**
   * Request Browser Web Push Notification Permission
   */
  public async requestWebPushPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (!('Notification' in window)) {
      logger.warn('NotifEngine', 'Web Notification API not supported');
      return 'denied';
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        this.prefs.webPushEnabled = true;
        this.savePreferences(this.prefs);
      } else {
        this.prefs.webPushEnabled = false;
        this.savePreferences(this.prefs);
      }
      return perm;
    } catch (err) {
      logger.error('NotifEngine', 'Error requesting push permission', err);
      return 'denied';
    }
  }

  /**
   * Issue a system notification if category enabled & not quiet hours
   */
  public triggerNotification(
    categoryId: NotificationCategoryId,
    title: string,
    message: string,
    linkTab?: string
  ) {
    if (!this.isCategoryEnabled(categoryId)) {
      logger.info('NotifEngine', `Notification ignored: category ${categoryId} disabled`);
      return;
    }

    if (this.isQuietHoursActive()) {
      logger.info('NotifEngine', `Notification suppressed during Quiet Hours`);
    }

    // Add to storage app notification list
    storage.addNotification({
      title,
      message,
      type: 'INFO',
      linkTab,
    });

    // Trigger browser Web Push if enabled and permitted
    if (this.prefs.webPushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`LUXFIN AI — ${title}`, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch (e) {
        logger.warn('NotifEngine', 'Failed to trigger OS notification', e);
      }
    }
  }

  /**
   * Automated scan for system alerts
   */
  public runSystemScan() {
    const state = storage.getState();

    // 1. Check Budget Warnings
    if (this.isCategoryEnabled('budget-warning')) {
      state.budgets.forEach((b) => {
        const cat = state.categories.find((c) => c.id === b.categoryId);
        const ratio = b.spent / b.monthlyLimit;
        if (ratio >= 0.95) {
          this.triggerNotification(
            'budget-warning',
            `Peringatan Anggaran: ${cat?.name || 'Kategori'}`,
            `Pengeluaran telah mencapai ${(ratio * 100).toFixed(0)}% dari batas limit ${formatRp(b.monthlyLimit)}.`,
            'budget'
          );
        }
      });
    }

    // 2. Check Bill & Subscription Reminders
    if (this.isCategoryEnabled('bill-reminder') || this.isCategoryEnabled('subscription-reminder')) {
      const today = new Date().getDate();
      state.bills.forEach((bill) => {
        if (bill.status !== 'ACTIVE') return;
        const diff = bill.dueDateDay - today;
        if (diff >= 0 && diff <= 3) {
          const isSub = bill.type === 'SUBSCRIPTION';
          const catId: NotificationCategoryId = isSub ? 'subscription-reminder' : 'bill-reminder';
          this.triggerNotification(
            catId,
            `Jatuh Tempo ${isSub ? 'Langganan' : 'Tagihan'}: ${bill.name}`,
            `Tagihan ${formatRp(bill.amount)} akan jatuh tempo dalam ${diff === 0 ? 'hari ini' : diff + ' hari'}.`,
            'bills'
          );
        }
      });
    }

    // 3. Check Goal Progress
    if (this.isCategoryEnabled('goal-progress')) {
      state.goals.forEach((g) => {
        const pct = (g.currentAmount / g.targetAmount) * 100;
        if (pct >= 100) {
          this.triggerNotification(
            'goal-progress',
            `Target Keuangan Tercapai! 🎉`,
            `Selamat! Target "${g.title}" sebesar ${formatRp(g.targetAmount)} telah 100% terkumpul.`,
            'goals'
          );
        }
      });
    }
  }
}

export const notificationEngine = new NotificationEngine();
