// SPDX-License-Identifier: Apache-2.0

import { type Pain001 } from '../../interfaces';

export const Pain001Sample: Pain001 = {
  TxTp: 'pain.001.001.11',
  CstmrCdtTrfInitn: {
    GrpHdr: {
      MsgId: '17fa-afea-48d6-b147-05c8463ea494',
      CreDtTm: '2023-02-03T07:03:17.438Z',
      NbOfTxs: 1,
      InitgPty: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: new Date('1968-02-01'),
              CityOfBirth: 'Unknown',
              CtryOfBirth: 'ZZ',
            },
            Othr: [
              {
                Id: '+36-432226947',
                SchmeNm: {
                  Prtry: 'MSISDN',
                },
              },
            ],
          },
        },
        CtctDtls: {
          MobNb: '+36-432226947',
        },
      },
    },
    PmtInf: {
      PmtInfId: '23730c89dd57490a9a79f9b3747e3c08',
      PmtMtd: 'TRA',
      ReqdAdvcTp: {
        DbtAdvc: {
          Cd: 'ADWD',
          Prtry: 'Advice with transaction details',
        },
      },
      ReqdExctnDt: {
        Dt: new Date('2023-02-03'),
        DtTm: new Date('2023-02-03T07:03:17.438Z'),
      },
      Dbtr: {
        Nm: 'April Blake Grant',
        Id: {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: new Date('1968-02-01'),
              CityOfBirth: 'Unknown',
              CtryOfBirth: 'ZZ',
            },
            Othr: [
              {
                Id: '+36-432226947',
                SchmeNm: {
                  Prtry: 'typolog028',
                },
              },
            ],
          },
        },
        CtctDtls: {
          MobNb: '+36-432226947',
        },
      },
      DbtrAcct: {
        Id: {
          Othr: [
            {
              Id: '+36-432226947',
              SchmeNm: {
                Prtry: 'MSISDN',
              },
            },
          ],
        },
        Nm: 'April Grant',
      },
      DbtrAgt: {
        FinInstnId: {
          ClrSysMmbId: {
            MmbId: 'typolog028',
          },
        },
      },
      CdtTrfTxInf: {
        PmtId: {
          EndToEndId: '8f37-9e6f-4c30-bb87-5e0e42f0f000',
        },
        PmtTpInf: {
          CtgyPurp: {
            Prtry: 'TRANSFER BLANK',
          },
        },
        Amt: {
          InstdAmt: {
            Amt: {
              Amt: '31020.89',
              Ccy: 'USD',
            },
          },
          EqvtAmt: {
            Amt: {
              Amt: '31020.89',
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
                BirthDt: new Date('1935-05-08'),
                CityOfBirth: 'Unknown',
                CtryOfBirth: 'ZZ',
              },
              Othr: [
                {
                  Id: '+42-966969344',
                  SchmeNm: {
                    Prtry: 'MSISDN',
                  },
                },
              ],
            },
          },
          CtctDtls: {
            MobNb: '+42-966969344',
          },
        },
        CdtrAcct: {
          Id: {
            Othr: [
              {
                Id: '+42-966969344',
                SchmeNm: {
                  Prtry: 'MSISDN',
                },
              },
            ],
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
          Ustrd: 'Payment of USD 30713.75 from April to Felicia',
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
                Amt: '307.14',
              },
              Xprtn: new Date('2021-11-30T10:38:56.000Z'),
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
              Lat: '-3,1609',
              Long: '38,3588',
            },
          },
        },
      },
    },
  },
};
