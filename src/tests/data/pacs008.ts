// SPDX-License-Identifier: Apache-2.0

import type { Pacs008 } from '../../interfaces';

export const Pacs008Sample: Pacs008 = {
  TxTp: 'pacs.008.001.10',
  TenantId: 'tenantId',
  FIToFICstmrCdtTrf: {
    GrpHdr: { MsgId: 'cabb-32c3-4ecf-944e-654855c80c38', CreDtTm: '2023-02-03T07:17:52.216Z', NbOfTxs: 1, SttlmInf: { SttlmMtd: 'CLRG' } },
    CdtTrfTxInf: {
      PmtId: { InstrId: '4ca819baa65d4a2c9e062f2055525046', EndToEndId: '701b-ae14-46fd-a2cf-88dda2875fdd' },
      IntrBkSttlmAmt: { Amt: { Amt: '31020.89', Ccy: 'USD' } },
      InstdAmt: { Amt: { Amt: '9000', Ccy: 'ZAR' } },
      ChrgBr: 'DEBT',
      ChrgsInf: { Amt: { Amt: '307.14', Ccy: 'USD' }, Agt: { FinInstnId: { ClrSysMmbId: { MmbId: 'typology003' } } } },
      InitgPty: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: { BirthDt: new Date('1968-02-01'), CityOfBirth: 'Unknown', CtryOfBirth: 'ZZ' },
            Othr: [{ Id: '+01-710694778', SchmeNm: { Prtry: 'MSISDN' } }],
          },
        },
        CtctDtls: { MobNb: '+01-710694778' },
      },
      Dbtr: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: { BirthDt: new Date('1968-02-01'), CityOfBirth: 'Unknown', CtryOfBirth: 'ZZ' },
            Othr: [{ Id: '+01-710694778', SchmeNm: { Prtry: 'MSISDN' } }],
          },
        },
        CtctDtls: { MobNb: '+01-710694778' },
      },
      DbtrAcct: { Id: { Othr: [{ Id: '+01-710694778', SchmeNm: { Prtry: 'MSISDN' } }] }, Nm: 'April Grant' },
      DbtrAgt: { FinInstnId: { ClrSysMmbId: { MmbId: 'typology003' } } },
      CdtrAgt: { FinInstnId: { ClrSysMmbId: { MmbId: 'dfsp002' } } },
      Cdtr: {
        Nm: 'Felicia Easton Quill',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: { BirthDt: new Date('1935-05-08'), CityOfBirth: 'Unknown', CtryOfBirth: 'ZZ' },
            Othr: [{ Id: '+07-197368463', SchmeNm: { Prtry: 'MSISDN' } }],
          },
        },
        CtctDtls: { MobNb: '+07-197368463' },
      },
      CdtrAcct: { Id: { Othr: [{ Id: '+07-197368463', SchmeNm: { Prtry: 'MSISDN' } }] }, Nm: 'Felicia Quill' },
      Purp: { Cd: 'MP2P' },
    },
    RgltryRptg: { Dtls: { Tp: 'BALANCE OF PAYMENTS', Cd: '100' } },
    RmtInf: { Ustrd: 'Payment of USD 30713.75 from April to Felicia' },
    SplmtryData: { Envlp: { Doc: { Xprtn: new Date('2023-02-03T07:17:52.216Z'), InitgPty: { Glctn: { Lat: '20', Long: '20' } } } } },
  },
};
