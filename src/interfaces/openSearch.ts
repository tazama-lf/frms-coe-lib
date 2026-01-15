export interface OpenSearchConfig {
  node: string | string[];
  auth?: {
    username: string;
    password: string;
  };
  ssl?: {
    rejectUnauthorized: boolean;
  };
  indexPrefix: string;
}

export interface AuditLogData {
  actorId?: string;
  actorRole?: string;
  actorName?: string;
  actorEmail?: string;
  resourceId?: string;
  resourceType?: string;
  sourceIp?: string;
  description: string;
  eventType: string;
  status: 'success' | 'failure' | 'info';
  tenantId?: string;
  outcome?: Record<string, unknown>;
  actionPerformed?: Record<string, unknown>;
}
