import { AIConversationSession, AIMessage, AIProposedAction } from '../types';

const AI_STORAGE_KEY = 'luxfin_ai_sessions_v1';
const ACTIVE_SESSION_KEY = 'luxfin_ai_active_session_v1';

export class AICopilotStorage {
  static getSessions(): AIConversationSession[] {
    try {
      const data = localStorage.getItem(AI_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load AI sessions from localStorage', e);
    }
    return [];
  }

  static saveSessions(sessions: AIConversationSession[]): void {
    try {
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save AI sessions to localStorage', e);
    }
  }

  static getActiveSessionId(): string | null {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  }

  static setActiveSessionId(id: string): void {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  }

  static createNewSession(initialTitle: string = 'Percakapan Baru'): AIConversationSession {
    const newSession: AIConversationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: initialTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg_welcome',
          sender: 'LUX_AI',
          text: 'Halo! Saya **LUX AI Money Copilot** — Asisten Finansial Pribadi Anda.\n\nBagaimana saya bisa membantu Anda mengoptimalkan anggaran, mencapai target tabungan, atau menganalisis keuangan Anda hari ini?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    const sessions = this.getSessions();
    sessions.unshift(newSession);
    this.saveSessions(sessions);
    this.setActiveSessionId(newSession.id);
    return newSession;
  }

  static addMessageToSession(sessionId: string, message: AIMessage): AIConversationSession | null {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    session.messages.push(message);
    session.updatedAt = new Date().toISOString();

    // Auto-update session title based on first user query if generic
    if (session.title === 'Percakapan Baru' && message.sender === 'USER') {
      const trimmed = message.text.trim();
      session.title = trimmed.length > 28 ? `${trimmed.substring(0, 28)}...` : trimmed;
    }

    this.saveSessions(sessions);
    return session;
  }

  static updateProposedActionStatus(
    sessionId: string,
    messageId: string,
    status: 'CONFIRMED' | 'CANCELLED'
  ): void {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const msg = session.messages.find((m) => m.id === messageId);
    if (msg && msg.proposedAction) {
      msg.proposedAction.status = status;
      this.saveSessions(sessions);
    }
  }

  static deleteSession(sessionId: string): void {
    let sessions = this.getSessions();
    sessions = sessions.filter((s) => s.id !== sessionId);
    this.saveSessions(sessions);

    if (this.getActiveSessionId() === sessionId) {
      if (sessions.length > 0) {
        this.setActiveSessionId(sessions[0].id);
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    }
  }
}
