// SPDX-License-Identifier: Apache-2.0

import { v7 } from 'uuid';
import { enrichmentBuilder } from '../src/builders/enrichmentBuilder';
import type { DBConfig, EnrichmentDB } from '../src/services/dbManager';

// redis and postgres are mocked in setup.jest.js

const enrichmentConfig: DBConfig = {
  certPath: 'TestEnrichment',
  databaseName: 'TestEnrichment',
  user: 'TestEnrichment',
  password: 'TestEnrichment',
  host: 'TestEnrichment',
  port: 5432,
};

describe('EnrichmentBuilder', () => {
  let manager: EnrichmentDB;

  beforeEach(async () => {
    jest.clearAllMocks();
    manager = {} as EnrichmentDB;
  });

  afterEach(() => {
    if (manager._enrichment) {
      manager._enrichment.end();
    }
  });

  describe('ingestData', () => {
    beforeEach(async () => {
      await enrichmentBuilder(manager, enrichmentConfig);
    });

    it('should execute a query with text and values', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);
      const sqlText = 'INSERT INTO test_table (data) VALUES ($1)';
      const values = ['test data'];

      await manager.ingestData(sqlText, values);

      expect(mockQuery).toHaveBeenCalledWith({
        text: sqlText,
        values,
      });
    });

    it('should execute a query with text only (no values)', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);
      const sqlText = "INSERT INTO test_table (data) VALUES ('test')";

      await manager.ingestData(sqlText);

      expect(mockQuery).toHaveBeenCalledWith({
        text: sqlText,
        values: [],
      });
    });

    it('should handle empty values array', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);
      const sqlText = 'SELECT * FROM test_table';

      await manager.ingestData(sqlText, []);

      expect(mockQuery).toHaveBeenCalledWith({
        text: sqlText,
        values: [],
      });
    });

    it('should handle multiple values', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);
      const jobId = v7();
      const checksum = 'test-checksum';
      const sqlText = 'INSERT INTO test_table (data, job_id, checksum) VALUES ($1, $2, $3)';
      const values = [{ key: 'value' }, jobId, checksum];

      await manager.ingestData(sqlText, values);

      expect(mockQuery).toHaveBeenCalledWith({
        text: sqlText,
        values,
      });
    });

    it('should propagate query errors', async () => {
      const mockError = new Error('Query execution failed');
      jest.spyOn(manager._enrichment, 'query').mockRejectedValue(mockError as never);
      const sqlText = 'INVALID SQL';

      await expect(manager.ingestData(sqlText)).rejects.toThrow('Query execution failed');
    });
  });

  describe('createTable', () => {
    beforeEach(async () => {
      await enrichmentBuilder(manager, enrichmentConfig);
    });

    it('should create table with correct schema', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);
      const tableName = 'test_enrichment_table';

      await manager.createTable(tableName);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(`CREATE TABLE IF NOT EXISTS ${tableName}`),
          values: [],
        }),
      );

      const calledQuery = mockQuery.mock.calls[0][0] as unknown as { text: string };
      expect(calledQuery.text).toContain('id UUID PRIMARY KEY DEFAULT gen_random_uuid()');
      expect(calledQuery.text).toContain('data JSONB NOT NULL');
      expect(calledQuery.text).toContain('job_id TEXT NOT NULL');
      expect(calledQuery.text).toContain('checksum TEXT NOT NULL');
      expect(calledQuery.text).toContain('created_at TIMESTAMP NOT NULL DEFAULT NOW()');
    });

    it('should handle table creation errors', async () => {
      const mockError = new Error('Table creation failed');
      jest.spyOn(manager._enrichment, 'query').mockRejectedValue(mockError as never);

      await expect(manager.createTable('test_table')).rejects.toThrow('Table creation failed');
    });

    it('should reject invalid table names', async () => {
      const invalidNames = [
        '', // empty
        '123_invalid', // starts with digit
        'table-name', // contains dash
        'table name', // contains space
        'table@name', // contains special character
        'a'.repeat(64), // too long (64 characters)
        'table$name', // contains dollar sign
        'table.name', // contains dot
      ];

      for (const invalidName of invalidNames) {
        await expect(manager.createTable(invalidName)).rejects.toThrow(/Invalid table name|Table name cannot be empty/);
      }
    });

    it('should accept valid table names', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);

      const validNames = [
        'valid_table',
        '_starts_with_underscore',
        'Table123',
        'a', // single character
        'A_B_C_123_xyz',
        'a'.repeat(63), // exactly 63 characters (max allowed)
      ];

      for (const validName of validNames) {
        await manager.createTable(validName);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining(`CREATE TABLE IF NOT EXISTS ${validName}`),
            values: [],
          }),
        );
      }
    });

    it('should create table with special characters in name', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);
      const tableName = 'test_table_2024';

      await manager.createTable(tableName);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(`CREATE TABLE IF NOT EXISTS ${tableName}`),
        }),
      );
    });
  });

  describe('deleteRows', () => {
    beforeEach(async () => {
      await enrichmentBuilder(manager, enrichmentConfig);
    });

    it('should delete all rows from specified table', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);
      const tableName = 'test_table';

      await manager.deleteRows(tableName);

      expect(mockQuery).toHaveBeenCalledWith({
        text: expect.stringContaining(`DELETE FROM ${tableName}`),
        values: [],
      });
    });

    it('should handle deletion errors', async () => {
      const mockError = new Error('Delete operation failed');
      jest.spyOn(manager._enrichment, 'query').mockRejectedValue(mockError as never);

      await expect(manager.deleteRows('test_table')).rejects.toThrow('Delete operation failed');
    });

    it('should delete rows from table with underscore in name', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);
      const tableName = 'enrichment_data_table';

      await manager.deleteRows(tableName);

      expect(mockQuery).toHaveBeenCalledWith({
        text: expect.stringContaining(`DELETE FROM ${tableName}`),
        values: [],
      });
    });

    it('should reject invalid table names for deleteRows', async () => {
      const invalidNames = [
        '', // empty
        '123_invalid', // starts with digit
        'table-name', // contains dash
        'table name', // contains space
        'table@name', // contains special character
        'a'.repeat(64), // too long (64 characters)
        'table$name', // contains dollar sign
        'table.name', // contains dot
      ];

      for (const invalidName of invalidNames) {
        await expect(manager.deleteRows(invalidName)).rejects.toThrow(/Invalid table name|Table name cannot be empty/);
      }
    });

    it('should accept valid table names for deleteRows', async () => {
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);

      const validNames = [
        'valid_table',
        '_starts_with_underscore',
        'Table123',
        'a', // single character
        'A_B_C_123_xyz',
        'a'.repeat(63), // exactly 63 characters (max allowed)
      ];

      for (const validName of validNames) {
        await manager.deleteRows(validName);
        expect(mockQuery).toHaveBeenCalledWith({
          text: expect.stringContaining(`DELETE FROM ${validName}`),
          values: [],
        });
      }
    });
  });

  describe('Integration Tests', () => {
    it('should support full lifecycle: create, insert, delete', async () => {
      await enrichmentBuilder(manager, enrichmentConfig);
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);
      const tableName = 'integration_test_table';

      // Create table
      await manager.createTable(tableName);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(`CREATE TABLE IF NOT EXISTS ${tableName}`),
        }),
      );

      // Insert data
      const insertQuery = `INSERT INTO ${tableName} (data, job_id, checksum) VALUES ($1, $2, $3)`;
      await manager.ingestData(insertQuery, [{ test: 'data' }, v7(), 'checksum123']);
      expect(mockQuery).toHaveBeenCalledWith({
        text: insertQuery,
        values: expect.any(Array),
      });

      // Delete rows
      await manager.deleteRows(tableName);
      expect(mockQuery).toHaveBeenCalledWith({
        text: expect.stringContaining(`DELETE FROM ${tableName}`),
        values: [],
      });

      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple operations on different tables', async () => {
      await enrichmentBuilder(manager, enrichmentConfig);
      const mockQuery = jest.spyOn(manager._enrichment, 'query').mockResolvedValue({} as never);

      await manager.createTable('table1');
      await manager.createTable('table2');
      await manager.ingestData('INSERT INTO table1 VALUES ($1)', ['data1']);
      await manager.ingestData('INSERT INTO table2 VALUES ($1)', ['data2']);
      await manager.deleteRows('table1');
      await manager.deleteRows('table2');

      expect(mockQuery).toHaveBeenCalledTimes(6);
    });
  });

  describe('SSL Configuration', () => {
    it('should initialize with SSL configuration when certPath is provided', async () => {
      const configWithCert: DBConfig = {
        ...enrichmentConfig,
        certPath: '__tests__/fake-cert.crt',
      };

      await enrichmentBuilder(manager, configWithCert);

      expect(manager._enrichment).toBeDefined();
    });

    it('should initialize without SSL when certPath is empty', async () => {
      const configNoCert: DBConfig = {
        ...enrichmentConfig,
        certPath: '',
      };

      await enrichmentBuilder(manager, configNoCert);

      expect(manager._enrichment).toBeDefined();
    });
  });
});
