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
  serviceName: string;
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
  metadata?: Record<string, unknown>;
}
