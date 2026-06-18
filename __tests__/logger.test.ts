// SPDX-License-Identifier: Apache-2.0

import { LoggerService } from '../src/services/logger';
import type { ProcessorConfig } from '../src/config/processor.config';

const processorConfig: ProcessorConfig = {
  maxCPU: 1,
  functionName: 'test-fn',
  nodeEnv: 'test',
};

describe('LoggerService - undefined attribute gating', () => {
  let previousLogLevel: string | undefined;

  beforeAll(() => {
    previousLogLevel = process.env.LOG_LEVEL;
    // trace activates every log-level callback
    process.env.LOG_LEVEL = 'trace';
  });

  afterAll(() => {
    if (previousLogLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = previousLogLevel;
    }
  });

  let infoSpy: jest.SpyInstance;
  let traceSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    traceSpy = jest.spyOn(console, 'trace').mockImplementation(() => undefined);
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when no serviceOperation or id is supplied', () => {
    it('omits the serviceOperation and id keys on an info log', () => {
      const sut = new LoggerService(processorConfig);

      sut.log('connected to nats');

      expect(infoSpy).toHaveBeenCalledTimes(1);
      const record = infoSpy.mock.calls[0][0] as Record<string, unknown>;
      expect(record.message).toBe('connected to nats');
      expect(Object.prototype.hasOwnProperty.call(record, 'serviceOperation')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(record, 'id')).toBe(false);
    });

    it('omits the keys on trace, debug and warn logs', () => {
      const sut = new LoggerService(processorConfig);

      sut.trace('trace line');
      sut.debug('debug line');
      sut.warn('warn line');

      for (const spy of [traceSpy, debugSpy, warnSpy]) {
        const record = spy.mock.calls[0][0] as Record<string, unknown>;
        expect(Object.prototype.hasOwnProperty.call(record, 'serviceOperation')).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(record, 'id')).toBe(false);
      }
    });

    it('omits the keys on an error log', () => {
      const sut = new LoggerService(processorConfig);

      sut.error('boom');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const record = errorSpy.mock.calls[0][0] as Record<string, unknown>;
      expect(record.message).toBe('boom');
      expect(Object.prototype.hasOwnProperty.call(record, 'serviceOperation')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(record, 'id')).toBe(false);
    });
  });

  describe('when serviceOperation and id are supplied', () => {
    it('includes both keys on an info log', () => {
      const sut = new LoggerService(processorConfig);

      sut.log('processing', 'handleTransaction', 'txn-123');

      const record = infoSpy.mock.calls[0][0] as Record<string, unknown>;
      expect(record).toMatchObject({
        message: 'processing',
        serviceOperation: 'handleTransaction',
        id: 'txn-123',
      });
    });

    it('includes both keys on an error log', () => {
      const sut = new LoggerService(processorConfig);

      sut.error('boom', undefined, 'handleTransaction', 'txn-123');

      const record = errorSpy.mock.calls[0][0] as Record<string, unknown>;
      expect(record).toMatchObject({
        message: 'boom',
        serviceOperation: 'handleTransaction',
        id: 'txn-123',
      });
    });
  });

  describe('when only one of serviceOperation or id is supplied', () => {
    it('includes serviceOperation and omits the absent id', () => {
      const sut = new LoggerService(processorConfig);

      sut.log('partial', 'handleTransaction');

      const record = infoSpy.mock.calls[0][0] as Record<string, unknown>;
      expect(record.serviceOperation).toBe('handleTransaction');
      expect(Object.prototype.hasOwnProperty.call(record, 'id')).toBe(false);
    });

    it('includes id and omits the absent serviceOperation', () => {
      const sut = new LoggerService(processorConfig);

      sut.log('partial', undefined, 'txn-123');

      const record = infoSpy.mock.calls[0][0] as Record<string, unknown>;
      expect(record.id).toBe('txn-123');
      expect(Object.prototype.hasOwnProperty.call(record, 'serviceOperation')).toBe(false);
    });
  });

  describe('error formatting variants', () => {
    it('omits the keys when logging an Error object with no metadata', () => {
      const sut = new LoggerService(processorConfig);

      sut.error(new Error('explosion'));

      const record = errorSpy.mock.calls[0][0] as Record<string, unknown>;
      expect(record.message).toContain('explosion');
      expect(Object.prototype.hasOwnProperty.call(record, 'serviceOperation')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(record, 'id')).toBe(false);
    });

    it('omits the keys when an innerError is supplied without metadata', () => {
      const sut = new LoggerService(processorConfig);

      sut.error('outer', new Error('inner'));

      const record = errorSpy.mock.calls[0][0] as Record<string, unknown>;
      expect(record.message).toContain('outer');
      expect(record.message).toContain('inner');
      expect(Object.prototype.hasOwnProperty.call(record, 'serviceOperation')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(record, 'id')).toBe(false);
    });
  });

  describe('fatal delegates to error', () => {
    it('omits the keys on a bare fatal log', () => {
      const sut = new LoggerService(processorConfig);

      sut.fatal('catastrophe');

      const record = errorSpy.mock.calls[0][0] as Record<string, unknown>;
      expect(record.message).toBe('catastrophe');
      expect(Object.prototype.hasOwnProperty.call(record, 'serviceOperation')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(record, 'id')).toBe(false);
    });
  });
});
