import { AILogEntry } from '../types';
import { logger } from './loggerService';

class AILoggerService {
  private aiLogs: AILogEntry[] = [];
  private maxLogs = 100;

  /**
   * Record a sanitized AI execution log entry.
   * Ensures no sensitive account numbers, API keys, or raw confidential user info are logged.
   */
  logExecution(entry: Omit<AILogEntry, 'id' | 'timestamp'>): AILogEntry {
    const fullEntry: AILogEntry = {
      id: `ailog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
      sanitizedMetadata: entry.sanitizedMetadata
        ? this.sanitizeObject(entry.sanitizedMetadata)
        : undefined,
    };

    this.aiLogs.unshift(fullEntry);
    if (this.aiLogs.length > this.maxLogs) {
      this.aiLogs.pop();
    }

    logger.info('AI_ENGINE', `Feature [${entry.featureName}] executed in ${entry.executionMs}ms (${entry.status})`, {
      model: entry.model,
      tokenEstimate: entry.tokenEstimate,
    });

    return fullEntry;
  }

  /**
   * Sanitizes object properties to obscure potential secret keys or sensitive raw tokens.
   */
  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ['apiKey', 'key', 'password', 'token', 'secret', 'accountNumber', 'creditCard'];

    for (const [key, value] of Object.entries(obj)) {
      const isSensitive = sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()));
      if (isSensitive) {
        sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  getAILogs(): AILogEntry[] {
    return [...this.aiLogs];
  }

  clearAILogs() {
    this.aiLogs = [];
  }
}

export const aiLogger = new AILoggerService();
