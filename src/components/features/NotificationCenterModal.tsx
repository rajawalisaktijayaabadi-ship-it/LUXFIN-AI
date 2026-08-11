import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle,
  Sliders,
  Smartphone,
  Moon,
  AlertTriangle,
  Calendar,
  CreditCard,
  Target,
  ShieldAlert,
  Zap,
  Sparkles,
  FileText,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { storage } from '../../utils/storage';
import {
  notificationEngine,
  NotificationPreferences,
  NOTIF_CATEGORY_DEFINITIONS,
  NotificationCategoryId,
} from '../../utils/notificationEngine';
import { ActiveTab } from '../common/BottomNav';
import { formatRp } from '../../utils/formatters';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const [activeTab, setActiveTabMode] = useState<'notifications' | 'preferences'>('notifications');
  const [prefs, setPrefs] = useState<NotificationPreferences>(notificationEngine.getPreferences());
  const [webPushStatus, setWebPushStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [, setTick] = useState(0);

  if (!isOpen) return null;

  const state = storage.getState();
  const notifications = state.notifications;
  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const handleToggleCategory = (catId: NotificationCategoryId) => {
    const updated = {
      ...prefs,
      categories: {
        ...prefs.categories,
        [catId]: !prefs.categories[catId],
      },
    };
    setPrefs(updated);
    notificationEngine.savePreferences(updated);
  };

  const handleToggleQuietHours = () => {
    const updated = { ...prefs, quietHoursEnabled: !prefs.quietHoursEnabled };
    setPrefs(updated);
    notificationEngine.savePreferences(updated);
  };

  const handleRequestWebPush = async () => {
    const perm = await notificationEngine.requestWebPushPermission();
    setWebPushStatus(perm);
    setPrefs(notificationEngine.getPreferences());
  };

  const handleTestNotification = () => {
    notificationEngine.triggerNotification(
      'ai-insight',
      'Uji Coba Notifikasi PWA',
      'Sistem notifikasi LUXFIN AI aktif & dikonfigurasi dengan sempurna!',
      'copilot'
    );
    setTick((prev) => prev + 1);
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => storage.markNotificationAsRead(n.id));
    setTick((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0B0D10] border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#E2B963]/15 text-[#E2B963]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notifikasi & Center Alert PWA</h3>
              <p className="text-[11px] text-gray-400">8 Kategori Alert Finansial & Control Center</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#14171E] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTabMode('notifications')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[#E2B963] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pusat Alert ({unreadNotifs.length})
          </button>

          <button
            onClick={() => setActiveTabMode('preferences')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-[#E2B963] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pengaturan & Preferensi
          </button>
        </div>

        {/* 1. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Daftar Notifikasi Terbaru</span>
              {unreadNotifs.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[#E2B963] hover:underline font-semibold cursor-pointer"
                >
                  Tandai Semua Dibaca
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-[#14171E] border border-white/5 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">Tidak Ada Notifikasi Baru</p>
                <p className="text-[11px] text-gray-400">
                  Seluruh tagihan, anggaran, & alert AI dalam kondisi aman.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      storage.markNotificationAsRead(n.id);
                      if (n.linkTab) {
                        setActiveTab(n.linkTab as ActiveTab);
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      n.isRead
                        ? 'bg-[#14171E]/40 border-white/5 opacity-70'
                        : 'bg-[#14171E] border-[#E2B963]/30 font-semibold'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white font-bold">{n.title}</p>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleTestNotification}
              className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E2B963]" /> Kirim Notifikasi Uji Coba
            </button>
          </div>
        )}

        {/* 2. PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            {/* Web Push Banner */}
            <div className="p-3.5 rounded-2xl bg-[#14171E] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#E2B963]" /> Web Push Browser Notification
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  webPushStatus === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {webPushStatus}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Izinkan notifikasi browser untuk menerima alert langsung di layar HP atau Laptop Anda.
              </p>
              {webPushStatus !== 'granted' && (
                <button
                  onClick={handleRequestWebPush}
                  className="w-full py-1.5 rounded-xl bg-[#E2B963] text-black text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Aktifkan Web Push Notification
                </button>
              )}
            </div>

            {/* Quiet Hours Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#14171E] border border-white/10 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-purple-400" /> Mode Jam Hening (Quiet Hours)
                </span>
                <p className="text-[10px] text-gray-400">
                  Tahan notifikasi non-darurat dari jam {prefs.quietHoursStart} s/d {prefs.quietHoursEnd}
                </p>
              </div>

              <button
                onClick={handleToggleQuietHours}
                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                  prefs.quietHoursEnabled ? 'bg-[#E2B963]' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${
                    prefs.quietHoursEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* 8 Category Toggles List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Pengaturan 8 Kategori Alert Finansial
              </h4>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {NOTIF_CATEGORY_DEFINITIONS.map((cat) => {
                  const isEnabled = prefs.categories[cat.id] ?? true;
                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl bg-[#14171E] border border-white/5 flex items-center justify-between"
                    >
                      <div className="pr-3">
                        <p className="text-xs font-bold text-white">{cat.title}</p>
                        <p className="text-[10px] text-gray-400">{cat.desc}</p>
                      </div>

                      <button
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`w-10 h-5 rounded-full transition-all relative shrink-0 cursor-pointer ${
                          isEnabled ? 'bg-emerald-500' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all ${
                            isEnabled ? 'left-5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
