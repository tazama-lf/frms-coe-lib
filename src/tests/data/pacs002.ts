import { type Pacs002 } from '../../interfaces';

export const Pacs002Sample: Pacs002 = {
  TxTp: 'pacs.002.001.12',
  FIToFIPmtSts: {
    GrpHdr: { MsgId: '136a-dbb6-43d8-a565-86b8f322411e', CreDtTm: '2023-02-03T09:53:58.069Z' },
    TxInfAndSts: {
      OrgnlInstrId: '5d158d92f70142a6ac7ffba30ac6c2db',
      OrgnlEndToEndId: '701b-ae14-46fd-a2cf-88dda2875fdd',
      TxSts: 'ACCC',
      ChrgsInf: [
        { Amt: { Amt: 307.14, Ccy: 'USD' }, Agt: { FinInstnId: { ClrSysMmbId: { MmbId: 'typolog028' } } } },
        { Amt: { Amt: 153.57, Ccy: 'USD' }, Agt: { FinInstnId: { ClrSysMmbId: { MmbId: 'typolog028' } } } },
        { Amt: { Amt: 300.71, Ccy: 'USD' }, Agt: { FinInstnId: { ClrSysMmbId: { MmbId: 'dfsp002' } } } },
      ],
      AccptncDtTm: new Date('2023-02-03T09:53:58.069Z'),
      InstgAgt: { FinInstnId: { ClrSysMmbId: { MmbId: 'typolog028' } } },
      InstdAgt: { FinInstnId: { ClrSysMmbId: { MmbId: 'dfsp002' } } },
    },
  },
};
