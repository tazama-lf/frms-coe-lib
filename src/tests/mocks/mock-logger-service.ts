import type { LoggerService } from '../../services/logger';
import { MockBase } from './mock-base';

/* ------------ Mock Types ------------- */
export type LoggerServiceMock = LoggerService & MockBase;

/* -------------- Factory -------------- */
export function MockLoggerServiceFactory(): LoggerServiceMock {
  // Create the object once, then fill in members (avoid touching undefined)
  const ls = new MockBase() as LoggerServiceMock;
  ls.seedDefaults = () => {
    ls.trace = jest.fn().mockImplementation(() => {});
    ls.debug = jest.fn().mockImplementation(() => {});
    ls.log = jest.fn().mockImplementation(() => {});
    ls.warn = jest.fn().mockImplementation(() => {});
    ls.error = jest.fn().mockImplementation(() => {});
    ls.fatal = jest.fn().mockImplementation(() => {});
  };
  // initialize defaults
  ls.resetMock();
  return ls;
}
