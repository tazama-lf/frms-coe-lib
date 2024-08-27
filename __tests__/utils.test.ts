// SPDX-License-Identifier: Apache-2.0

import { createConditionsBuffer, decodeConditionsBuffer } from '../src/helpers/protobuf';
import { Acct } from '../src/interfaces/event-flow/EntityConditionEdge';

describe('Should point to correct collections in transactionHistory', () => {
  test('se/deserialise EFRuP conditions', () => {
    const acct: Acct = {
      id: '1010101010',
      schmeNm: {
        prtry: 'Mxx',
      },
      agt: {
        finInstnId: {
          clrSysMmbId: {
            mmbId: 'dfsp001',
          },
        },
      },
    };
    const conditions = [
      {
        condId: '26819',
        condTp: 'non-overridable-block',
        incptnDtTm: '2024-09-01T24:00:00.999Z',
        xprtnDtTm: '2024-09-03T24:00:00.999Z',
        condRsn: 'R001',
        usr: 'bob',
        creDtTm: '2024-08-23T11:46:53.091Z',
        prsptvs: [
          {
            prsptv: 'governed_as_creditor_by',
            evtTp: ['pacs.008.001.10', 'pacs.002.001.12'],
            incptnDtTm: '2024-09-01T24:00:00.999Z',
            xprtnDtTm: '2024-09-03T24:00:00.999Z',
          },
          {
            prsptv: 'governed_as_debtor_by',
            evtTp: ['pacs.008.001.10', 'pacs.002.001.12'],
            incptnDtTm: '2024-09-01T24:00:00.999Z',
            xprtnDtTm: '2024-09-03T24:00:00.999Z',
          },
        ],
      },
    ];

    const entity = {
      id: '+27733161225',
      schmeNm: {
        prtry: 'MSISDN',
      },
    };
    const accountConditions = { acct: acct, conditions };
    const bufAcc = createConditionsBuffer(accountConditions);
    expect(bufAcc).toBeDefined();

    const deserialisedAccConditions = decodeConditionsBuffer(bufAcc!);
    expect(deserialisedAccConditions).toBeDefined();
    expect(deserialisedAccConditions).toEqual(accountConditions);

    const entityConditons = { ntty: entity, conditions };
    const bufEntity = createConditionsBuffer(entityConditons);
    expect(bufEntity).toBeDefined();

    const deserialisedEntityConditions = decodeConditionsBuffer(bufEntity!);
    expect(deserialisedEntityConditions).toBeDefined();
    expect(deserialisedEntityConditions).toEqual(entityConditons);
  });
});
