import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Home,
  History,
  MessageSquarePlus,
  AlertTriangle,
  WifiOff,
  Trash2,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { AIMessage, AIConversationSession, AIProposedAction } from '../../types';
import { FinancialContextBuilder } from '../../services/financialContextBuilder';
import { AICopilotStorage } from '../../utils/aiCopilotStorage';
import { AILandingScreen } from './AILandingScreen';
import { AIHistoryDrawer } from './AIHistoryDrawer';
import { AIActionConfirmationSheet } from './AIActionConfirmationSheet';

export const LuxAICopilot: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LANDING' | 'CHAT'>('LANDING');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Analisis konteks keuangan...');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<AIConversationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Sessions on Mount
  useEffect(() => {
    const loadedSessions = AICopilotStorage.getSessions();
    setSessions(loadedSessions);

    const activeId = AICopilotStorage.getActiveSessionId();
    if (activeId && loadedSessions.some((s) => s.id === activeId)) {
      setActiveSessionId(activeId);
    } else if (loadedSessions.length > 0) {
      setActiveSessionId(loadedSessions[0].id);
      AICopilotStorage.setActiveSessionId(loadedSessions[0].id);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (viewMode === 'CHAT') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages, isLoading, viewMode]);

  const handleStartNewChat = () => {
    const newSession = AICopilotStorage.createNewSession();
    const updated = AICopilotStorage.getSessions();
    setSessions(updated);
    setActiveSessionId(newSession.id);
    setViewMode('CHAT');
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    AICopilotStorage.setActiveSessionId(id);
    setViewMode('CHAT');
  };

  const handleDeleteSession = (id: string) => {
    AICopilotStorage.deleteSession(id);
    const updated = AICopilotStorage.getSessions();
    setSessions(updated);

    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        setActiveSessionId(null);
        setViewMode('LANDING');
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    // Ensure we have an active session
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newSession = AICopilotStorage.createNewSession();
      currentSessionId = newSession.id;
      setActiveSessionId(currentSessionId);
    }

    const userMsg: AIMessage = {
      id: `msg_usr_${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Save User Message
    const updatedSession = AICopilotStorage.addMessageToSession(currentSessionId, userMsg);
    setSessions(AICopilotStorage.getSessions());

    if (!textToSend) setInputMessage('');
    setViewMode('CHAT');
    setIsLoading(true);

    // Dynamic Loading Pulse
    const steps = [
      'Membaca data akun & saldo...',
      'Menganalisis pengeluaran & anggaran...',
      'Gemini 3.6 Flash memproses simulasi...',
      'Menyusun rekomendasi finansial...',
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingStep(steps[stepIdx]);
    }, 1200);

    try {
      const financialContext = FinancialContextBuilder.buildContext();
      const currentHistory = updatedSession ? updatedSession.messages : [];

      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          financialContext,
          conversationHistory: currentHistory.slice(-8), // Send last 8 messages for context
        }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (res.ok && data.success) {
        const aiMsg: AIMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'LUX_AI',
          text: data.reply,
          proposedAction: data.proposedAction ? { ...data.proposedAction, status: 'PENDING' } : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        AICopilotStorage.addMessageToSession(currentSessionId, aiMsg);
        setSessions(AICopilotStorage.getSessions());
      } else {
        throw new Error(data.error || 'Gagal terhubung dengan server AI.');
      }
    } catch (err: any) {
      clearInterval(interval);
      const errorMsg: AIMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'LUX_AI',
        text: `Mohon maaf, terjadi kendala jaringan/server: ${err.message}`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      AICopilotStorage.addMessageToSession(currentSessionId, errorMsg);
      setSessions(AICopilotStorage.getSessions());
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionConfirmed = (actionTitle: string, details: string, msgId: string) => {
    if (!activeSessionId) return;

    AICopilotStorage.updateProposedActionStatus(activeSessionId, msgId, 'CONFIRMED');

    const confirmationMsg: AIMessage = {
      id: `msg_confirm_${Date.now()}`,
      sender: 'LUX_AI',
      text: `✅ **${actionTitle} Berhasil Disimpan!**\n\n${details}\n\nData keuangan Anda telah diperbarui secara otomatis.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    AICopilotStorage.addMessageToSession(activeSessionId, confirmationMsg);
    setSessions(AICopilotStorage.getSessions());
  };

  const handleActionCancelled = (msgId: string) => {
    if (!activeSessionId) return;
    AICopilotStorage.updateProposedActionStatus(activeSessionId, msgId, 'CANCELLED');
    setSessions(AICopilotStorage.getSessions());
  };

  return (
    <div className="p-3 sm:p-5 max-w-4xl mx-auto min-h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-300">
      {/* Top Header Navigation */}
      <div className="p-3.5 rounded-3xl bg-[#14171E] border border-[#E2B963]/30 flex items-center justify-between mb-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('LANDING')}
            className={`p-2 rounded-2xl transition-colors ${
              viewMode === 'LANDING'
                ? 'bg-[#E2B963] text-black font-bold'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
            title="Beranda AI"
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E2B963] to-[#B8860B] flex items-center justify-center text-black font-black text-xs shadow-md">
              LX
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#F7F6F2] flex items-center gap-2">
                LUX AI Money Copilot
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E2B963]/10 text-[#E2B963] font-mono border border-[#E2B963]/20">
                  Gemini 3.6
                </span>
              </h3>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                {isOffline ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Mode Offline
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Context Injected
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-[#E2B963]" />
            <span className="hidden sm:inline">Riwayat</span>
          </button>

          <button
            onClick={handleStartNewChat}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chat Baru</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'LANDING' ? (
        <AILandingScreen
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          onNewChat={handleStartNewChat}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col bg-[#12151D] border border-white/10 rounded-3xl p-4 shadow-2xl overflow-hidden relative min-h-[500px]">
          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none mb-4">
            {(!activeSession || activeSession.messages.length === 0) && (
              <div className="text-center py-16 text-gray-500 text-xs">
                Mulai percakapan dengan menanyakan apapun terkait keuangan Anda.
              </div>
            )}

            {activeSession?.messages.map((m) => {
              const isUser = m.sender === 'USER';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 animate-in fade-in duration-200 ${
                    isUser ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs shrink-0 shadow-md ${
                      isUser
                        ? 'bg-gradient-to-tr from-[#E2B963] to-[#B8860B] text-black font-bold'
                        : 'bg-[#1C202B] text-[#E2B963] border border-[#E2B963]/30'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-3xl text-xs max-w-[85%] leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-[#E2B963] text-black font-medium rounded-tr-none'
                        : m.isError
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-tl-none'
                        : 'bg-[#181B22] text-[#F7F6F2] border border-white/10 rounded-tl-none space-y-2'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                    {/* AI Proposed Action Card */}
                    {m.proposedAction && (
                      <AIActionConfirmationSheet
                        action={m.proposedAction}
                        messageId={m.id}
                        onConfirmed={(title, details) => handleActionConfirmed(title, details, m.id)}
                        onCancelled={() => handleActionCancelled(m.id)}
                      />
                    )}

                    <span className={`text-[9px] block text-right opacity-60 pt-1`}>{m.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {/* Loading / Typing State */}
            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-[#E2B963] bg-[#181B22] p-4 rounded-3xl border border-[#E2B963]/30 w-fit animate-pulse shadow-md">
                <Loader2 className="w-4 h-4 animate-spin text-[#E2B963]" />
                <span className="font-medium">{loadingStep}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Bar */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none text-[11px] shrink-0 border-t border-white/5 pt-3">
            {[
              'Kenapa pengeluaran saya naik?',
              'Apakah saya terlalu boros?',
              'Berapa budget makanan saya?',
              'Saya ingin menabung Rp20 juta dalam 8 bulan.',
              'Apakah saya mampu membeli laptop Rp15 juta?',
              'Bagaimana cara melunasi utang saya?',
              'Analisis keuangan saya bulan ini.',
              'Berapa dana darurat ideal saya?',
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 rounded-full bg-[#181B22] border border-white/10 text-gray-300 hover:text-white hover:border-[#E2B963] whitespace-nowrap transition-all shrink-0"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="relative shrink-0 pt-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tanyakan analisis, kelayakan barang, atau simulasi keuangan..."
              className="w-full bg-[#181B22] border border-white/10 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E2B963] shadow-inner"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-3 p-2 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black hover:brightness-110 disabled:opacity-40 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conversation History Drawer */}
      <AIHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleStartNewChat}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
};
