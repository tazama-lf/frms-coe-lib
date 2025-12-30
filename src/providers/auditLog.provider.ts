import { AuditLogger } from '../services/auditLog.service';

export const AuditProvider = {
  provide: AuditLogger,
  useFactory: async () => {
    const logger = AuditLogger.getInstance();
    await logger.init();
    return logger;
  },
};
