export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 200;

  private log(level: LogLevel, module: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (import.meta.env.DEV) {
      const color =
        level === 'ERROR'
          ? 'color: #EF4444; font-weight: bold;'
          : level === 'WARN'
          ? 'color: #F59E0B; font-weight: bold;'
          : level === 'INFO'
          ? 'color: #10B981;'
          : 'color: #9CA3AF;';

      console.log(`%c[${level}] [${module}] ${message}`, color, data !== undefined ? data : '');
    }
  }

  debug(module: string, message: string, data?: any) {
    this.log('DEBUG', module, message, data);
  }

  info(module: string, message: string, data?: any) {
    this.log('INFO', module, message, data);
  }

  warn(module: string, message: string, data?: any) {
    this.log('WARN', module, message, data);
  }

  error(module: string, message: string, data?: any) {
    this.log('ERROR', module, message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new LoggerService();
