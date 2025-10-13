// SPDX-License-Identifier: Apache-2.0

import type { Pain013 } from '../../interfaces';

export const Pain013Sample: Pain013 = {
  TxTp: 'pain.013.001.09',
  TenantId: 'tenantId',
  CdtrPmtActvtnReq: {
    GrpHdr: {
      MsgId: '53bf-5388-4aa3-ac23-6180ac1ce5ab',
      CreDtTm: '2023-02-01T12:47:23.470Z',
      NbOfTxs: 1,
      InitgPty: {
        Nm: 'Horatio Sam Ford',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: { BirthDt: new Date('1981-04-11'), CityOfBirth: 'Unknown', CtryOfBirth: 'ZZ' },
            Othr: [{ Id: '+58-210165155', SchmeNm: { Prtry: 'MSISDN' } }],
          },
        },
        CtctDtls: { MobNb: '+58-210165155' },
      },
    },
    PmtInf: {
      PmtInfId: '7a25e5694b8649d09702cc2162d07550',
      PmtMtd: 'TRA',
      ReqdAdvcTp: { DbtAdvc: { Cd: 'ADWD', Prtry: 'Advice with transaction details' } },
      ReqdExctnDt: { DtTm: new Date('2023-02-01T12:47:23.470Z') },
      XpryDt: { DtTm: new Date('2023-02-01T12:47:23.470Z') },
      Dbtr: {
        Nm: '2023-02-01T12:47:23.470Z',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: { BirthDt: new Date('2021-10-07'), CityOfBirth: 'Unknown', CtryOfBirth: 'zz' },
            Othr: [{ Id: 'ZZ', SchmeNm: { Prtry: '+58-210165155' } }],
          },
        },
        CtctDtls: { MobNb: '+58-210165155' },
      },
      DbtrAcct: { Nm: 'Test', Id: { Othr: [{ Id: '+58-210165155', SchmeNm: { Prtry: '+58-210165155' }, Nm: 'PASSPORT' }] } },
      DbtrAgt: { FinInstnId: { ClrSysMmbId: { MmbId: 'Horatio Ford' } } },
      CdtTrfTxInf: {
        PmtId: { EndToEndId: '02d5-dd5d-4995-a643-bd31c0a89e7a' },
        PmtTpInf: { CtgyPurp: { Prtry: 'TRANSFER' } },
        Amt: {
          InstdAmt: { Amt: { Amt: '50431891779910900', Ccy: 'USD' } },
          EqvtAmt: { Amt: { Amt: '50431891779910900', Ccy: 'USD' }, CcyOfTrf: 'USD' },
        },
        ChrgBr: 'DEBT',
        CdtrAgt: { FinInstnId: { ClrSysMmbId: { MmbId: 'dfsp002' } } },
        Cdtr: {
          Nm: 'April Sam Adamson',
          Id: {
            PrvtId: {
              DtAndPlcOfBirth: { BirthDt: new Date('1923-04-26'), CityOfBirth: 'Unknown', CtryOfBirth: 'ZZ' },
              Othr: [{ Id: '+04-830018596', SchmeNm: { Prtry: 'MSISDN' } }],
            },
          },
          CtctDtls: { MobNb: '+04-830018596' },
        },
        CdtrAcct: { Id: { Othr: [{ Id: '+04-830018596', SchmeNm: { Prtry: 'dfsp002' } }] }, Nm: 'April Adamson' },
        Purp: { Cd: 'MP2P' },
        RgltryRptg: { Dtls: { Tp: 'BALANCE OF PAYMENTS', Cd: '100' } },
        RmtInf: { Ustrd: 'Payment of USD 49932566118723700.89 from Ivan to April' },
        SplmtryData: {
          Envlp: {
            Doc: {
              PyeeRcvAmt: { Amt: { Amt: '4906747824834590', Ccy: 'USD' } },
              PyeeFinSvcsPrvdrFee: { Amt: { Amt: '49067478248345.9', Ccy: 'USD' } },
              PyeeFinSvcsPrvdrComssn: { Amt: { Amt: '0', Ccy: 'USD' } },
            },
          },
        },
      },
    },
    SplmtryData: { Envlp: { Doc: { InitgPty: { Glctn: { Lat: '-3.1675', Long: '39.059' } } } } },
  },
};
