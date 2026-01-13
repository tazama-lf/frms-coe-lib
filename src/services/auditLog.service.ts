// SPDX-License-Identifier: Apache-2.0
import { Client } from '@opensearch-project/opensearch';
import { openSearchConfig } from '../config/openSearch.config';
import type { AuditLogData } from '../interfaces/openSearch';

export class AuditLogger {
  private readonly client: Client;
  private static instance: AuditLogger;
  private isInitialized = false;
  private readonly createdIndices = new Set<string>();
  private readonly creatingIndices = new Map<string, Promise<void>>();

  // 1. Store the service name here
  private serviceName = 'unknown-service';

  private constructor() {
    this.client = new Client({
      node: openSearchConfig().node,
      auth: openSearchConfig().auth,
      ssl: openSearchConfig().ssl,
    });
  }

  // Singleton Pattern
  public static getInstance(): AuditLogger {
    AuditLogger.instance ||= new AuditLogger();
    return AuditLogger.instance;
  }

  private async ensureSchema(): Promise<void> {
    const templateName = 'audit-logs-template';
    const templateBody = {
      index_patterns: [`${openSearchConfig().indexPrefix}-*`],
      template: {
        mappings: {
          properties: {
            timestamp: { type: 'date' },
            serviceName: { type: 'keyword' },
            actorId: { type: 'keyword' },
            actorRole: { type: 'keyword' },
            actorName: { type: 'text' },
            actorEmail: { type: 'keyword' },
            eventType: { type: 'keyword' },
            description: { type: 'text' },
            status: { type: 'keyword' },
            resourceId: { type: 'keyword' },
            resourceType: { type: 'keyword' },
            sourceIp: { type: 'ip' },
            outcome: { type: 'object', enabled: true },
            action_performed: { type: 'object', enabled: true },
            tenantId: { type: 'keyword' },
          },
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
      },
    };

    const exists = await this.client.indices.existsTemplate({ name: templateName });
    if (!exists.body) {
      await this.client.indices.putTemplate({
        name: templateName,
        body: templateBody,
      });
    }
  }

  // 2. Init sets the name once
  public async init(serviceName: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.serviceName = serviceName;
      await this.ensureSchema();
      // [AuditLogger] Initialized for service
      this.isInitialized = true;
    } catch (error) {
      // [AuditLogger] Init failed'
    }
  }

  public async log(data: AuditLogData): Promise<void> {
    const date = new Date();
    // Monthly Index: audit-logs-YYYY.MM
    const MONTH_OFFSET = 1;
    const PAD_WIDTH = 2;
    const PAD_CHAR = '0';
    const month = date.getMonth() + MONTH_OFFSET;
    const monthStr = String(month).padStart(PAD_WIDTH, PAD_CHAR);
    const indexName = `${openSearchConfig().indexPrefix}-${date.getFullYear()}.${monthStr}`;

    const doc = {
      timestamp: date.toISOString(),
      serviceName: this.serviceName,
      actorId: data.actorId,
      actorRole: data.actorRole,
      actorName: data.actorName,
      actorEmail: data.actorEmail,
      resourceId: data.resourceId,
      resourceType: data.resourceType,
      sourceIp: data.sourceIp,
      description: data.description,
      eventType: data.eventType,
      status: data.status,
      action_performed: data.action_performed,
      outcome: data.outcome,
      tenantId: data.tenantId,
    };

    try {
      await this.client.index({
        index: indexName,
        body: doc,
        refresh: 'wait_for',
      });
    } catch (error) {
      const cause = error instanceof Error ? error : new Error(String(error));
      throw new Error('Audit Log Failed: Transaction Aborted.', { cause });
    }
  }
}
