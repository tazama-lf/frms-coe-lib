import { AuditLogger } from '../services/auditLog.service';

/**
 * Creates the AuditLogger provider with a specific Service Name.
 * Use this in your AppModule imports.
 */
export const createAuditProvider = (
  serviceName: string,
): {
  provide: string;
  useFactory: () => Promise<AuditLogger>;
} => ({
  provide: 'AUDIT_LOGGER',
  useFactory: async (): Promise<AuditLogger> => {
    const logger = AuditLogger.getInstance();

    // Initialize it once with the name passed from AppModule
    await logger.init(serviceName);

    return logger;
  },
});
