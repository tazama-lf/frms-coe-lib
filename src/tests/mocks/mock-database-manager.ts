import type { Pool } from 'pg';
import type { DatabaseManagerInstance, ManagerConfig } from '../../services/dbManager';
import { MockBase } from './mock-base';

/* ------------ Mock Types ------------- */
/** Replace only the query signature; everything else on EventHistoryDB is optional. */
type EventHistoryMock = Omit<Pool, 'query'> & {
  // Return a Promise of { rows: Row[] }, and accept a single string parameter
  query: jest.Mock;
};
/** Replace only the query signature; everything else on RawHistoryDB is optional. */
type RawHistoryMock = Omit<Pool, 'query'> & {
  // Return a Promise of { rows: Row[] }, and accept a single string parameter
  query: jest.Mock;
};

export type DatabaseManagerMock<T extends ManagerConfig> = DatabaseManagerInstance<T> &
  MockBase & {
    _eventHistory: EventHistoryMock;
    _rawHistory: RawHistoryMock;
    // If your real type is boolean/Promise<boolean>, use that:
    isReadyCheck: jest.Mock<string | Promise<string>, []>;
    quit: jest.Mock<void | Promise<void>, []>;
  };

/* ---------- Mock Factories ---------- */

function eventHistoryMockFactory(): EventHistoryMock {
  return {
    query: jest.fn().mockResolvedValue({ rows: [] }),
  } as EventHistoryMock;
}
function rawHistoryMockFactory(): RawHistoryMock {
  return {
    query: jest.fn().mockResolvedValue({ rows: [] }),
  } as RawHistoryMock;
}

export function MockDatabaseManagerFactory<T extends ManagerConfig>(): DatabaseManagerMock<T> {
  // Create the object once, then fill in members (avoid touching undefined)
  const dm = new MockBase() as DatabaseManagerMock<T>;

  dm._eventHistory = eventHistoryMockFactory();
  dm._rawHistory = rawHistoryMockFactory();
  dm.isReadyCheck = jest.fn<string, []>().mockReturnValue('');
  dm.quit = jest.fn<void, []>().mockImplementation(() => {});

  dm.seedDefaults = () => {
    dm._eventHistory.query.mockResolvedValue({ rows: [] });
    dm._rawHistory.query.mockResolvedValue({ rows: [] });
    dm.isReadyCheck.mockReturnValue('');
    dm.quit.mockImplementation(() => {});
  };

  // initialize defaults
  dm.resetMock();
  return dm;
}
