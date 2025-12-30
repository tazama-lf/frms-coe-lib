// SPDX-License-Identifier: Apache-2.0
import { Client } from '@opensearch-project/opensearch';
import { openSearchConfig } from '../config/openSearch.config';
import type { AuditLogData } from '../interfaces/openSearch';

export class AuditLogger {
  private readonly client: Client;
  private static instance: AuditLogger;
  private isInitialized = false;

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
            resource: { type: 'keyword' },
            sourceIp: { type: 'ip' },
            metadata: { type: 'object', enabled: true },
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

  /**
   * Run this once on startup to ensure the Index Template exists.
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.ensureSchema();
      this.isInitialized = true;
    } catch (error) {
      // We don't throw here to allow app startup, but logs will fail later if not fixed.
    }
  }

  /**
   * STRICT SYNCHRONOUS LOGGING
   * Blocks the application until OpenSearch confirms the write.
   */
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
      serviceName: data.serviceName,
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
      metadata: data.metadata ?? {},
    };

    try {
      await this.client.index({
        index: indexName,
        body: doc,
        refresh: 'wait_for',
      });
    } catch (error) {
      throw new Error('Audit Log Failed: Transaction Aborted.', error instanceof Error ? error : undefined);
    }
  }
}
