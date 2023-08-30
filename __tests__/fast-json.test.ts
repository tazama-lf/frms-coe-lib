import { messageSchema } from '../src/helpers/schemas/message';
import fastJson from 'fast-json-stringify';

const pain001 = {
  TxTp: 'pain.001.001.11',
  CstmrCdtTrfInitn: {
    GrpHdr: {
      MsgId: 'a924f75ead2f4b54a93501cd86c6ad12',
      CreDtTm: '2023-07-04T14:26:56.431Z',
      NbOfTxs: 1,
      InitgPty: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: '1968-02-01',
              CityOfBirth: 'Unknown',
              CtryOfBirth: 'ZZ',
            },
            Othr: {
              Id: '+27730975224',
              SchmeNm: {
                Prtry: 'MSISDN',
              },
            },
          },
        },
        CtctDtls: {
          MobNb: '+27-730975224',
        },
      },
    },
    PmtInf: {
      PmtInfId: '5ab4fc7355de4ef8a75b78b00a681ed2',
      PmtMtd: 'TRA',
      ReqdAdvcTp: {
        DbtAdvc: {
          Cd: 'ADWD',
          Prtry: 'Advice with transaction details',
        },
      },
      ReqdExctnDt: {
        Dt: '2023-06-02',
        DtTm: '2023-06-02T07:50:57.000Z',
      },
      Dbtr: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: '1998-06-15',
              CityOfBirth: 'Unknown',
              CtryOfBirth: 'ZZ',
            },
            Othr: {
              Id: 'dbtr_aa34afb5add0435f96acc22032e2762d',
              SchmeNm: {
                Prtry: 'ACTIO_EID',
              },
            },
          },
        },
        CtctDtls: {
          MobNb: '+27-730975224',
        },
      },
      DbtrAcct: {
        Id: {
          Othr: {
            Id: 'dbtrAcct_f65fa5122d8144d5b6a7d4df8af14023',
            SchmeNm: {
              Prtry: 'MSISDN',
            },
          },
        },
        Nm: 'April Grant',
      },
      DbtrAgt: {
        FinInstnId: {
          ClrSysMmbId: {
            MmbId: 'dfsp001',
          },
        },
      },
      CdtTrfTxInf: {
        PmtId: {
          EndToEndId: 'c231aed7d81f486b92dec09f834ed541',
        },
        PmtTpInf: {
          CtgyPurp: {
            Prtry: 'TRANSFER',
          },
        },
        Amt: {
          InstdAmt: {
            Amt: {
              Amt: 1000,
              Ccy: 'USD',
            },
          },
          EqvtAmt: {
            Amt: {
              Amt: 1000,
              Ccy: 'USD',
            },
            CcyOfTrf: 'USD',
          },
        },
        ChrgBr: 'DEBT',
        CdtrAgt: {
          FinInstnId: {
            ClrSysMmbId: {
              MmbId: 'dfsp002',
            },
          },
        },
        Cdtr: {
          Nm: 'Felicia Easton Quill',
          Id: {
            PrvtId: {
              DtAndPlcOfBirth: {
                BirthDt: '1935-05-08',
                CityOfBirth: 'Unknown',
                CtryOfBirth: 'ZZ',
              },
              Othr: {
                Id: 'cdtr_7369631dd41149f1ac1688dcbb68c7bb',
                SchmeNm: {
                  Prtry: 'ACTIO_EID',
                },
              },
            },
          },
          CtctDtls: {
            MobNb: '+27-707650428',
          },
        },
        CdtrAcct: {
          Id: {
            Othr: {
              Id: 'cdtrAcct_a530a88f5f064bdd92c990e0bcce232c',
              SchmeNm: {
                Prtry: 'MSISDN',
              },
            },
          },
          Nm: 'Felicia Quill',
        },
        Purp: {
          Cd: 'MP2P',
        },
        RgltryRptg: {
          Dtls: {
            Tp: 'BALANCE OF PAYMENTS',
            Cd: '100',
          },
        },
        RmtInf: {
          Ustrd: 'Generic payment description',
        },
        SplmtryData: {
          Envlp: {
            Doc: {
              Dbtr: {
                FrstNm: 'April',
                MddlNm: 'Blake',
                LastNm: 'Grant',
                MrchntClssfctnCd: 'BLANK',
              },
              Cdtr: {
                FrstNm: 'Felicia',
                MddlNm: 'Easton',
                LastNm: 'Quill',
                MrchntClssfctnCd: 'BLANK',
              },
              DbtrFinSvcsPrvdrFees: {
                Ccy: 'USD',
                Amt: 0,
              },
              Xprtn: '2021-11-30T10:38:56.000Z',
            },
          },
        },
      },
    },
    SplmtryData: {
      Envlp: {
        Doc: {
          InitgPty: {
            InitrTp: 'CONSUMER',
            Glctn: {
              Lat: '-3.1609',
              Long: '38.3588',
            },
          },
        },
      },
    },
  },
};

const pacs002 = {
  TxTp: 'pacs.002.001.12',
  FIToFIPmtSts: {
    GrpHdr: {
      MsgId: '78fdbd775ed74a70bff45e1bb4c879b7',
      CreDtTm: '2023-07-04T14:41:56.431Z',
    },
    TxInfAndSts: {
      OrgnlInstrId: '5ab4fc7355de4ef8a75b78b00a681ed2',
      OrgnlEndToEndId: 'c231aed7d81f486b92dec09f834ed541',
      TxSts: 'ACSC',
      ChrgsInf: [
        {
          Amt: {
            Amt: 0,
            Ccy: 'USD',
          },
          Agt: {
            FinInstnId: {
              ClrSysMmbId: {
                MmbId: 'dfsp001',
              },
            },
          },
        },
        {
          Amt: {
            Amt: 0,
            Ccy: 'USD',
          },
          Agt: {
            FinInstnId: {
              ClrSysMmbId: {
                MmbId: 'dfsp001',
              },
            },
          },
        },
        {
          Amt: {
            Amt: 0,
            Ccy: 'USD',
          },
          Agt: {
            FinInstnId: {
              ClrSysMmbId: {
                MmbId: 'dfsp002',
              },
            },
          },
        },
      ],
      AccptncDtTm: '2023-06-02T07:52:31.000Z',
      InstgAgt: {
        FinInstnId: {
          ClrSysMmbId: {
            MmbId: 'dfsp001',
          },
        },
      },
      InstdAgt: {
        FinInstnId: {
          ClrSysMmbId: {
            MmbId: 'dfsp002',
          },
        },
      },
    },
  },
};

const pain013 = {
  TxTp: 'pain.013.001.09',
  CdtrPmtActvtnReq: {
    GrpHdr: {
      MsgId: '574e842dc0d94c1387b956f1d01e1616',
      CreDtTm: '2023-07-04T14:31:56.431Z',
      NbOfTxs: 1,
      InitgPty: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: '1968-02-01',
              CityOfBirth: 'Unknown',
              CtryOfBirth: 'ZZ',
            },
            Othr: {
              Id: '+27730975224',
              SchmeNm: {
                Prtry: 'MSISDN',
              },
            },
          },
        },
        CtctDtls: {
          MobNb: '+27-730975224',
        },
      },
    },
    PmtInf: {
      PmtInfId: '5ab4fc7355de4ef8a75b78b00a681ed2',
      PmtMtd: 'TRA',
      ReqdAdvcTp: {
        DbtAdvc: {
          Cd: 'ADWD',
          Prtry: 'Advice with transaction details',
        },
      },
      ReqdExctnDt: {
        DtTm: '2023-06-02T07:51:48.000Z',
      },
      XpryDt: {
        DtTm: '2021-11-30T10:38:56.000Z',
      },
      Dbtr: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: '1998-06-15',
              CityOfBirth: 'Unknown',
              CtryOfBirth: 'ZZ',
            },
            Othr: {
              Id: 'dbtr_aa34afb5add0435f96acc22032e2762d',
              SchmeNm: {
                Prtry: 'ACTIO_EID',
              },
            },
          },
        },
        CtctDtls: {
          MobNb: '+27-730975224',
        },
      },
      DbtrAcct: {
        Id: {
          Othr: {
            Id: 'dbtrAcct_f65fa5122d8144d5b6a7d4df8af14023',
            SchmeNm: {
              Prtry: 'MSISDN',
            },
          },
        },
        Nm: 'April Grant',
      },
      DbtrAgt: {
        FinInstnId: {
          ClrSysMmbId: {
            MmbId: 'dfsp001',
          },
        },
      },
      CdtTrfTxInf: {
        PmtId: {
          EndToEndId: 'c231aed7d81f486b92dec09f834ed541',
        },
        PmtTpInf: {
          CtgyPurp: {
            Prtry: 'TRANSFER BLANK',
          },
        },
        Amt: {
          InstdAmt: {
            Amt: {
              Amt: 1000,
              Ccy: 'USD',
            },
          },
          EqvtAmt: {
            Amt: {
              Amt: 1000,
              Ccy: 'USD',
            },
            CcyOfTrf: 'USD',
          },
        },
        ChrgBr: 'DEBT',
        CdtrAgt: {
          FinInstnId: {
            ClrSysMmbId: {
              MmbId: 'dfsp002',
            },
          },
        },
        Cdtr: {
          Nm: 'Felicia Easton Quill',
          Id: {
            PrvtId: {
              DtAndPlcOfBirth: {
                BirthDt: '1935-05-08',
                CityOfBirth: 'Unknown',
                CtryOfBirth: 'ZZ',
              },
              Othr: {
                Id: 'cdtr_7369631dd41149f1ac1688dcbb68c7bb',
                SchmeNm: {
                  Prtry: 'ACTIO_EID',
                },
              },
            },
          },
          CtctDtls: {
            MobNb: '+27-707650428',
          },
        },
        CdtrAcct: {
          Id: {
            Othr: {
              Id: 'cdtrAcct_a530a88f5f064bdd92c990e0bcce232c',
              SchmeNm: {
                Prtry: 'MSISDN',
              },
            },
          },
          Nm: 'Felicia Quill',
        },
        Purp: {
          Cd: 'MP2P',
        },
        RgltryRptg: {
          Dtls: {
            Tp: 'BALANCE OF PAYMENTS',
            Cd: '100',
          },
        },
        SplmtryData: {
          Envlp: {
            Doc: {
              PyeeRcvAmt: {
                Amt: {
                  Amt: 0,
                  Ccy: 'USD',
                },
              },
              PyeeFinSvcsPrvdrFee: {
                Amt: {
                  Amt: 0,
                  Ccy: 'USD',
                },
              },
              PyeeFinSvcsPrvdrComssn: {
                Amt: {
                  Amt: 0,
                  Ccy: 'USD',
                },
              },
            },
          },
        },
      },
    },
    SplmtryData: {
      Envlp: {
        Doc: {
          InitgPty: {
            Glctn: {
              Lat: '-3.1609',
              Long: '38.3588',
            },
          },
        },
      },
    },
  },
};

const pacs008 = {
  TxTp: 'pacs.008.001.10',
  FIToFICstmrCdt: {
    GrpHdr: {
      MsgId: '72151857aaaf4146a806d01dbe110916',
      CreDtTm: '2023-07-04T14:36:56.431Z',
      NbOfTxs: 1,
      SttlmInf: {
        SttlmMtd: 'CLRG',
      },
    },
    CdtTrfTxInf: {
      PmtId: {
        InstrId: '5ab4fc7355de4ef8a75b78b00a681ed2',
        EndToEndId: 'c231aed7d81f486b92dec09f834ed541',
      },
      IntrBkSttlmAmt: {
        Amt: {
          Amt: 0,
          Ccy: 'USD',
        },
      },
      InstdAmt: {
        Amt: {
          Amt: 1000,
          Ccy: 'USD',
        },
      },
      ChrgBr: 'DEBT',
      ChrgsInf: {
        Amt: {
          Amt: 0,
          Ccy: 'USD',
        },
        Agt: {
          FinInstnId: {
            ClrSysMmbId: {
              MmbId: 'dfsp001',
            },
          },
        },
      },
      InitgPty: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: '1968-02-01',
              CityOfBirth: 'Unknown',
              CtryOfBirth: 'ZZ',
            },
            Othr: {
              Id: '+27730975224',
              SchmeNm: {
                Prtry: 'MSISDN',
              },
            },
          },
        },
        CtctDtls: {
          MobNb: '+27-730975224',
        },
      },
      Dbtr: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: '1998-06-15',
              CityOfBirth: 'Unknown',
              CtryOfBirth: 'ZZ',
            },
            Othr: {
              Id: 'dbtr_aa34afb5add0435f96acc22032e2762d',
              SchmeNm: {
                Prtry: 'ACTIO_EID',
              },
            },
          },
        },
        CtctDtls: {
          MobNb: '+27-730975224',
        },
      },
      DbtrAcct: {
        Id: {
          Othr: {
            Id: 'dbtrAcct_f65fa5122d8144d5b6a7d4df8af14023',
            SchmeNm: {
              Prtry: 'MSISDN',
            },
          },
        },
        Nm: 'April Grant',
      },
      DbtrAgt: {
        FinInstnId: {
          ClrSysMmbId: {
            MmbId: 'dfsp001',
          },
        },
      },
      CdtrAgt: {
        FinInstnId: {
          ClrSysMmbId: {
            MmbId: 'dfsp002',
          },
        },
      },
      Cdtr: {
        Nm: 'Felicia Easton Quill',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: '1935-05-08',
              CityOfBirth: 'Unknown',
              CtryOfBirth: 'ZZ',
            },
            Othr: {
              Id: 'cdtr_7369631dd41149f1ac1688dcbb68c7bb',
              SchmeNm: {
                Prtry: 'ACTIO_EID',
              },
            },
          },
        },
        CtctDtls: {
          MobNb: '+27-707650428',
        },
      },
      CdtrAcct: {
        Id: {
          Othr: {
            Id: 'cdtrAcct_a530a88f5f064bdd92c990e0bcce232c',
            SchmeNm: {
              Prtry: 'MSISDN',
            },
          },
        },
        Nm: 'Felicia Quill',
      },
      Purp: {
        Cd: 'MP2P',
      },
    },
    RgltryRptg: {
      Dtls: {
        Tp: 'BALANCE OF PAYMENTS',
        Cd: '100',
      },
    },
    RmtInf: {
      Ustrd: 'Generic payment description',
    },
    SplmtryData: {
      Envlp: {
        Doc: {
          Xprtn: '2021-11-30T10:38:56.000Z',
        },
      },
    },
  },
};

const stringifyTransaction = fastJson(messageSchema as Record<string, unknown>);

describe('Check if schemas are valid for objects', () => {
  test('Pacs 002', () => {
    stringifyTransaction({
      transaction: pacs002,
      metaData: {
        foo: 5,
      },
    });
  });

  test('Pain 001', () => {
    stringifyTransaction({
      transaction: pain001,
    });
  });

  test('Pain 013', () => {
    stringifyTransaction({
      transaction: pain013,
    });
  });

  test('Pacs 008', () => {
    stringifyTransaction({
      transaction: pacs008,
    });
  });

  test('Pacs 008 STR', () => {
    const stringify = stringifyTransaction({ transaction: pacs008 });
    expect(typeof stringify).toBe('string');
  });
});
