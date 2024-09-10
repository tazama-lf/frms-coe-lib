// SPDX-License-Identifier: Apache-2.0

import {
  createCacheConditionsBuffer,
  createConditionsBuffer,
  createSimpleConditionsBuffer,
  decodeCacheConditionsBuffer,
  decodeConditionsBuffer,
  decodeSimpleConditionsBuffer,
} from '../src/helpers/protobuf';
import { AccountCondition, EntityCondition } from '../src/interfaces';
import { Acct } from '../src/interfaces/event-flow/EntityConditionEdge';

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

describe('Should serialise/deserialise EFRuP conditions', () => {
  test('se/deserialise EFRuP conditions', () => {
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

  test('se/deserialise ALL EFRuP conditions through graph/edges', () => {
    const accountConditions = { acct: acct, conditions };
    const entityConditons = { ntty: entity, conditions };
    let conds = { account: accountConditions, entity: entityConditons };
    const bufConds = createCacheConditionsBuffer(conds);
    expect(bufConds).toBeDefined();
    expect(bufConds?.byteLength).toBeGreaterThan(0);

    const deserialisedConditions = decodeCacheConditionsBuffer(bufConds!);
    expect(deserialisedConditions).toBeDefined();
    expect(deserialisedConditions).toEqual(conds);
  });

  test('se/deserialise conditions from conditions collections', () => {
    const items: (EntityCondition | AccountCondition)[] = [
      {
        evtTp: ['pacs.008.001.10'],
        condTp: 'non-overridable-block',
        prsptv: 'creditor',
        incptnDtTm: '2024-09-10T00:00:00.000Z',
        condRsn: 'R001',
        acct,
        forceCret: true,
        usr: 'bob',
        creDtTm: '2024-09-09T07:38:16.421Z',
        condId: 'a66e78a0-2508-4fca-aac3-3207d8d2f88b',
      },
      {
        evtTp: ['pacs.008.001.10'],
        condTp: 'overridable-block',
        prsptv: 'both',
        incptnDtTm: '2024-09-17T21:00:00.999Z',
        condRsn: 'R001',
        ntty: entity,
        forceCret: true,
        usr: 'bob',
        creDtTm: '2024-09-09T07:38:24.349Z',
        condId: 'c859d422-d67f-454e-aae2-5011b0b16af2',
      },
      {
        evtTp: ['pacs.008.001.10'],
        condTp: 'overridable-block',
        prsptv: 'both',
        incptnDtTm: '2024-09-17T21:00:00.999Z',
        xprtnDtTm: '2024-10-10T21:00:00.999Z',
        condRsn: 'R001',
        ntty: entity,
        forceCret: true,
        usr: 'bob',
        creDtTm: '2024-09-10T08:38:40.265Z',
        condId: '62b21fc0-5f4f-4f49-9cb0-c69e0123b3ec',
      },
    ];
    let bufConds = createSimpleConditionsBuffer(items);
    expect(bufConds).toBeDefined();
    expect(bufConds?.byteLength).toBeGreaterThan(0);

    const deserialisedConditions = decodeSimpleConditionsBuffer(bufConds!);
    expect(deserialisedConditions).toBeDefined();
    expect(deserialisedConditions).toEqual(items);
  });
});
