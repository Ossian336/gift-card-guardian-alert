
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class SecureLogger {
  private isDevelopment = import.meta.env.DEV;

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/password|token|key|secret/gi, '[REDACTED]');
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (/password|token|key|secret/i.test(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }
    return data;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? this.sanitizeData(context) : undefined
    };

    if (this.isDevelopment) {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`,
        context ? logEntry.context : ''
      );
    } else {
      // In production, only log errors
      if (level === 'error') {
        console.error(`[${logEntry.timestamp}] ERROR: ${message}`);
      }
    }
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }
}

export const logger = new SecureLogger();
