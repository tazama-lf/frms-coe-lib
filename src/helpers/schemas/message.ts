// SPDX-License-Identifier: Apache-2.0

import fastJson from 'fast-json-stringify';

const pain001 = 'pain.001.001.11';
const pacs008 = 'pacs.008.001.10';
const pacs002 = 'pacs.002.001.12';

export const messageSchema = {
  title: 'Generated schema for Message',
  type: 'object',
  definitions: {
    ruleResult: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        cfg: {
          type: 'string',
        },
        subRuleRef: {
          type: 'string',
        },
        result: {
          type: 'boolean',
        },
        reason: {
          type: 'string',
        },
        wght: {
          type: 'number',
        },
        desc: {
          type: 'string',
        },
        prcgTm: {
          type: 'number',
        },
      },
      required: ['id', 'cfg', 'subRuleRef', 'result', 'reason', 'desc', 'prcgTm'],
    },
    typologyResult: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        cfg: {
          type: 'string',
        },
        desc: {
          type: 'string',
        },
        result: {
          type: 'number',
        },
        threshold: {
          type: 'number',
        },
        ruleResults: {
          type: 'array',
          items: {
            $ref: '#/definitions/ruleResult',
          },
        },
        prcgTm: {
          type: 'number',
        },
        review: {
          type: 'boolean',
        },
      },
      required: ['id', 'cfg', 'desc', 'result', 'threshold', 'ruleResults', 'prcgTm'],
    },
    tadpResult: {
      type: 'object',
      properties: {
        cfg: {
          type: 'string',
        },
        typologyResult: {
          type: 'array',
          items: {
            $ref: '#/definitions/typologyResult',
          },
        },
        id: {
          type: 'string',
        },
        prcgTm: {
          type: 'number',
        },
      },
      required: ['cfg', 'typologyResult', 'id', 'prcgTm'],
    },
    metaData: {
      type: 'object',
      patternProperties: {
        '^.*$': {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'object',
            },
            {
              type: 'number',
            },
            {
              type: 'null',
            },
          ],
        },
      },
      additionalProperties: false,
      required: [],
    },
  },
  properties: {
    networkMap: {
      type: 'object',
      properties: {
        active: {
          type: 'boolean',
        },
        cfg: {
          type: 'string',
        },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              host: {
                type: 'string',
              },
              cfg: {
                type: 'string',
              },
              txTp: {
                type: 'string',
              },
              typologies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                    },
                    host: {
                      type: 'string',
                    },
                    cfg: {
                      type: 'string',
                    },
                    rules: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                          },
                          host: {
                            type: 'string',
                          },
                          cfg: {
                            type: 'string',
                          },
                        },
                        required: ['id', 'host', 'cfg'],
                      },
                    },
                  },
                  required: ['id', 'host', 'cfg', 'rules'],
                },
              },
            },
            required: ['id', 'host', 'cfg', 'typologies'],
          },
        },
      },
      required: ['active', 'messages'],
    },
    DataCache: {
      type: 'object',
      properties: {
        cdtrId: {
          type: 'string',
        },
        dbtrId: {
          type: 'string',
        },
        cdtrAcctId: {
          type: 'string',
        },
        dbtrAcctId: {
          type: 'string',
        },
        amt: {
          type: 'object',
          properties: {
            amt: {
              type: 'number',
            },
            ccy: {
              type: 'string',
            },
          },
          required: ['amt', 'ccy'],
        },
      },
      required: ['cdtrId', 'dbtrId', 'cdtrAcctId', 'dbtrAcctId'],
    },
    metaData: {
      $ref: '#/definitions/metaData',
    },
    ruleResult: {
      $ref: '#/definitions/ruleResult',
    },
    typologyResult: {
      $ref: '#/definitions/typologyResult',
    },
    tadpResult: {
      $ref: '#/definitions/tadpResult',
    },
    transaction: {
      type: 'object',
      properties: {},
      if: {
        type: 'object',
        properties: {
          TxTp: { type: 'string', enum: [pain001] },
        },
      },
      then: {
        // pain 001
        type: 'object',
        properties: {
          TxTp: { type: 'string', enum: [pain001] },
          CstmrCdtTrfInitn: {
            type: 'object',
            properties: {
              GrpHdr: {
                type: 'object',
                properties: {
                  MsgId: {
                    type: 'string',
                  },
                  CreDtTm: {
                    type: 'string',
                  },
                  NbOfTxs: {
                    type: 'number',
                  },
                  InitgPty: {
                    type: 'object',
                    properties: {
                      Nm: {
                        type: 'string',
                      },
                      Id: {
                        type: 'object',
                        properties: {
                          PrvtId: {
                            type: 'object',
                            properties: {
                              DtAndPlcOfBirth: {
                                type: 'object',
                                properties: {
                                  BirthDt: {
                                    type: 'string',
                                  },
                                  CityOfBirth: {
                                    type: 'string',
                                  },
                                  CtryOfBirth: {
                                    type: 'string',
                                  },
                                },
                                required: ['BirthDt', 'CityOfBirth', 'CtryOfBirth'],
                              },
                              Othr: {
                                type: 'object',
                                properties: {
                                  Id: {
                                    type: 'string',
                                  },
                                  SchmeNm: {
                                    type: 'object',
                                    properties: {
                                      Prtry: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['Prtry'],
                                  },
                                },
                                required: ['Id', 'SchmeNm'],
                              },
                            },
                            required: ['DtAndPlcOfBirth', 'Othr'],
                          },
                        },
                        required: ['PrvtId'],
                      },
                      CtctDtls: {
                        type: 'object',
                        properties: {
                          MobNb: {
                            type: 'string',
                          },
                        },
                        required: ['MobNb'],
                      },
                    },
                    required: ['Nm', 'Id', 'CtctDtls'],
                  },
                },
                required: ['MsgId', 'CreDtTm', 'NbOfTxs', 'InitgPty'],
              },
              PmtInf: {
                type: 'object',
                properties: {
                  PmtInfId: {
                    type: 'string',
                  },
                  PmtMtd: {
                    type: 'string',
                  },
                  ReqdAdvcTp: {
                    type: 'object',
                    properties: {
                      DbtAdvc: {
                        type: 'object',
                        properties: {
                          Cd: {
                            type: 'string',
                          },
                          Prtry: {
                            type: 'string',
                          },
                        },
                        required: ['Cd', 'Prtry'],
                      },
                    },
                    required: ['DbtAdvc'],
                  },
                  ReqdExctnDt: {
                    type: 'object',
                    properties: {
                      Dt: {
                        type: 'string',
                      },
                      DtTm: {
                        type: 'string',
                      },
                    },
                    required: ['Dt', 'DtTm'],
                  },
                  Dbtr: {
                    type: 'object',
                    properties: {
                      Nm: {
                        type: 'string',
                      },
                      Id: {
                        type: 'object',
                        properties: {
                          PrvtId: {
                            type: 'object',
                            properties: {
                              DtAndPlcOfBirth: {
                                type: 'object',
                                properties: {
                                  BirthDt: {
                                    type: 'string',
                                  },
                                  CityOfBirth: {
                                    type: 'string',
                                  },
                                  CtryOfBirth: {
                                    type: 'string',
                                  },
                                },
                                required: ['BirthDt', 'CityOfBirth', 'CtryOfBirth'],
                              },
                              Othr: {
                                type: 'object',
                                properties: {
                                  Id: {
                                    type: 'string',
                                  },
                                  SchmeNm: {
                                    type: 'object',
                                    properties: {
                                      Prtry: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['Prtry'],
                                  },
                                },
                                required: ['Id', 'SchmeNm'],
                              },
                            },
                            required: ['DtAndPlcOfBirth', 'Othr'],
                          },
                        },
                        required: ['PrvtId'],
                      },
                      CtctDtls: {
                        type: 'object',
                        properties: {
                          MobNb: {
                            type: 'string',
                          },
                        },
                        required: ['MobNb'],
                      },
                    },
                    required: ['Nm', 'Id', 'CtctDtls'],
                  },
                  DbtrAcct: {
                    type: 'object',
                    properties: {
                      Id: {
                        type: 'object',
                        properties: {
                          Othr: {
                            type: 'object',
                            properties: {
                              Id: {
                                type: 'string',
                              },
                              SchmeNm: {
                                type: 'object',
                                properties: {
                                  Prtry: {
                                    type: 'string',
                                  },
                                },
                                required: ['Prtry'],
                              },
                            },
                            required: ['Id', 'SchmeNm'],
                          },
                        },
                        required: ['Othr'],
                      },
                      Nm: {
                        type: 'string',
                      },
                    },
                    required: ['Id', 'Nm'],
                  },
                  DbtrAgt: {
                    type: 'object',
                    properties: {
                      FinInstnId: {
                        type: 'object',
                        properties: {
                          ClrSysMmbId: {
                            type: 'object',
                            properties: {
                              MmbId: {
                                type: 'string',
                              },
                            },
                            required: ['MmbId'],
                          },
                        },
                        required: ['ClrSysMmbId'],
                      },
                    },
                    required: ['FinInstnId'],
                  },
                  CdtTrfTxInf: {
                    type: 'object',
                    properties: {
                      PmtId: {
                        type: 'object',
                        properties: {
                          EndToEndId: {
                            type: 'string',
                          },
                        },
                        required: ['EndToEndId'],
                      },
                      PmtTpInf: {
                        type: 'object',
                        properties: {
                          CtgyPurp: {
                            type: 'object',
                            properties: {
                              Prtry: {
                                type: 'string',
                              },
                            },
                            required: ['Prtry'],
                          },
                        },
                        required: ['CtgyPurp'],
                      },
                      Amt: {
                        type: 'object',
                        properties: {
                          InstdAmt: {
                            type: 'object',
                            properties: {
                              Amt: {
                                type: 'object',
                                properties: {
                                  Amt: {
                                    type: 'number',
                                  },
                                  Ccy: {
                                    type: 'string',
                                  },
                                },
                                required: ['Amt', 'Ccy'],
                              },
                            },
                            required: ['Amt'],
                          },
                          EqvtAmt: {
                            type: 'object',
                            properties: {
                              Amt: {
                                type: 'object',
                                properties: {
                                  Amt: {
                                    type: 'number',
                                  },
                                  Ccy: {
                                    type: 'string',
                                  },
                                },
                                required: ['Amt', 'Ccy'],
                              },
                              CcyOfTrf: {
                                type: 'string',
                              },
                            },
                            required: ['Amt', 'CcyOfTrf'],
                          },
                        },
                        required: ['InstdAmt', 'EqvtAmt'],
                      },
                      ChrgBr: {
                        type: 'string',
                      },
                      CdtrAgt: {
                        type: 'object',
                        properties: {
                          FinInstnId: {
                            type: 'object',
                            properties: {
                              ClrSysMmbId: {
                                type: 'object',
                                properties: {
                                  MmbId: {
                                    type: 'string',
                                  },
                                },
                                required: ['MmbId'],
                              },
                            },
                            required: ['ClrSysMmbId'],
                          },
                        },
                        required: ['FinInstnId'],
                      },
                      Cdtr: {
                        type: 'object',
                        properties: {
                          Nm: {
                            type: 'string',
                          },
                          Id: {
                            type: 'object',
                            properties: {
                              PrvtId: {
                                type: 'object',
                                properties: {
                                  DtAndPlcOfBirth: {
                                    type: 'object',
                                    properties: {
                                      BirthDt: {
                                        type: 'string',
                                      },
                                      CityOfBirth: {
                                        type: 'string',
                                      },
                                      CtryOfBirth: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['BirthDt', 'CityOfBirth', 'CtryOfBirth'],
                                  },
                                  Othr: {
                                    type: 'object',
                                    properties: {
                                      Id: {
                                        type: 'string',
                                      },
                                      SchmeNm: {
                                        type: 'object',
                                        properties: {
                                          Prtry: {
                                            type: 'string',
                                          },
                                        },
                                        required: ['Prtry'],
                                      },
                                    },
                                    required: ['Id', 'SchmeNm'],
                                  },
                                },
                                required: ['DtAndPlcOfBirth', 'Othr'],
                              },
                            },
                            required: ['PrvtId'],
                          },
                          CtctDtls: {
                            type: 'object',
                            properties: {
                              MobNb: {
                                type: 'string',
                              },
                            },
                            required: ['MobNb'],
                          },
                        },
                        required: ['Nm', 'Id', 'CtctDtls'],
                      },
                      CdtrAcct: {
                        type: 'object',
                        properties: {
                          Id: {
                            type: 'object',
                            properties: {
                              Othr: {
                                type: 'object',
                                properties: {
                                  Id: {
                                    type: 'string',
                                  },
                                  SchmeNm: {
                                    type: 'object',
                                    properties: {
                                      Prtry: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['Prtry'],
                                  },
                                },
                                required: ['Id', 'SchmeNm'],
                              },
                            },
                            required: ['Othr'],
                          },
                          Nm: {
                            type: 'string',
                          },
                        },
                        required: ['Id', 'Nm'],
                      },
                      Purp: {
                        type: 'object',
                        properties: {
                          Cd: {
                            type: 'string',
                          },
                        },
                        required: ['Cd'],
                      },
                      RgltryRptg: {
                        type: 'object',
                        properties: {
                          Dtls: {
                            type: 'object',
                            properties: {
                              Tp: {
                                type: 'string',
                              },
                              Cd: {
                                type: 'string',
                              },
                            },
                            required: ['Tp', 'Cd'],
                          },
                        },
                        required: ['Dtls'],
                      },
                      RmtInf: {
                        type: 'object',
                        properties: {
                          Ustrd: {
                            type: 'string',
                          },
                        },
                        required: ['Ustrd'],
                      },
                      SplmtryData: {
                        type: 'object',
                        properties: {
                          Envlp: {
                            type: 'object',
                            properties: {
                              Doc: {
                                type: 'object',
                                properties: {
                                  Dbtr: {
                                    type: 'object',
                                    properties: {
                                      FrstNm: {
                                        type: 'string',
                                      },
                                      MddlNm: {
                                        type: 'string',
                                      },
                                      LastNm: {
                                        type: 'string',
                                      },
                                      MrchntClssfctnCd: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['FrstNm', 'MddlNm', 'LastNm', 'MrchntClssfctnCd'],
                                  },
                                  Cdtr: {
                                    type: 'object',
                                    properties: {
                                      FrstNm: {
                                        type: 'string',
                                      },
                                      MddlNm: {
                                        type: 'string',
                                      },
                                      LastNm: {
                                        type: 'string',
                                      },
                                      MrchntClssfctnCd: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['FrstNm', 'MddlNm', 'LastNm', 'MrchntClssfctnCd'],
                                  },
                                  DbtrFinSvcsPrvdrFees: {
                                    type: 'object',
                                    properties: {
                                      Ccy: {
                                        type: 'string',
                                      },
                                      Amt: {
                                        type: 'number',
                                      },
                                    },
                                    required: ['Ccy', 'Amt'],
                                  },
                                  Xprtn: {
                                    type: 'string',
                                  },
                                },
                                required: ['Dbtr', 'Cdtr', 'DbtrFinSvcsPrvdrFees', 'Xprtn'],
                              },
                            },
                            required: ['Doc'],
                          },
                        },
                        required: ['Envlp'],
                      },
                    },
                    required: [
                      'PmtId',
                      'PmtTpInf',
                      'Amt',
                      'ChrgBr',
                      'CdtrAgt',
                      'Cdtr',
                      'CdtrAcct',
                      'Purp',
                      'RgltryRptg',
                      'RmtInf',
                      'SplmtryData',
                    ],
                  },
                },
                required: ['PmtInfId', 'PmtMtd', 'ReqdAdvcTp', 'ReqdExctnDt', 'Dbtr', 'DbtrAcct', 'DbtrAgt', 'CdtTrfTxInf'],
              },
              SplmtryData: {
                type: 'object',
                properties: {
                  Envlp: {
                    type: 'object',
                    properties: {
                      Doc: {
                        type: 'object',
                        properties: {
                          InitgPty: {
                            type: 'object',
                            properties: {
                              InitrTp: {
                                type: 'string',
                              },
                              Glctn: {
                                type: 'object',
                                properties: {
                                  Lat: {
                                    type: 'string',
                                  },
                                  Long: {
                                    type: 'string',
                                  },
                                },
                                required: ['Lat', 'Long'],
                              },
                            },
                            required: ['InitrTp', 'Glctn'],
                          },
                        },
                        required: ['InitgPty'],
                      },
                    },
                    required: ['Doc'],
                  },
                },
                required: ['Envlp'],
              },
            },
            required: ['GrpHdr', 'PmtInf', 'SplmtryData'],
          },
        },
      },
      else: {
        properties: {},
        if: {
          type: 'object',
          properties: {
            TxTp: { type: 'string', enum: [pacs002] },
          },
        },
        then: {
          type: 'object',
          properties: {
            //  pacs 002
            TxTp: { type: 'string', enum: [pacs002] },
            FIToFIPmtSts: {
              type: 'object',
              properties: {
                GrpHdr: {
                  type: 'object',
                  properties: {
                    MsgId: {
                      type: 'string',
                    },
                    CreDtTm: {
                      type: 'string',
                    },
                  },
                  required: ['MsgId', 'CreDtTm'],
                },
                TxInfAndSts: {
                  type: 'object',
                  properties: {
                    OrgnlInstrId: {
                      type: 'string',
                    },
                    OrgnlEndToEndId: {
                      type: 'string',
                    },
                    TxSts: {
                      type: 'string',
                    },
                    ChrgsInf: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          Amt: {
                            type: 'object',
                            properties: {
                              Amt: {
                                type: 'number',
                              },
                              Ccy: {
                                type: 'string',
                              },
                            },
                            required: ['Amt', 'Ccy'],
                          },
                          Agt: {
                            type: 'object',
                            properties: {
                              FinInstnId: {
                                type: 'object',
                                properties: {
                                  ClrSysMmbId: {
                                    type: 'object',
                                    properties: {
                                      MmbId: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['MmbId'],
                                  },
                                },
                                required: ['ClrSysMmbId'],
                              },
                            },
                            required: ['FinInstnId'],
                          },
                        },
                        required: ['Amt', 'Agt'],
                      },
                    },
                    AccptncDtTm: {
                      type: 'string',
                    },
                    InstgAgt: {
                      type: 'object',
                      properties: {
                        FinInstnId: {
                          type: 'object',
                          properties: {
                            ClrSysMmbId: {
                              type: 'object',
                              properties: {
                                MmbId: {
                                  type: 'string',
                                },
                              },
                              required: ['MmbId'],
                            },
                          },
                          required: ['ClrSysMmbId'],
                        },
                      },
                      required: ['FinInstnId'],
                    },
                    InstdAgt: {
                      type: 'object',
                      properties: {
                        FinInstnId: {
                          type: 'object',
                          properties: {
                            ClrSysMmbId: {
                              type: 'object',
                              properties: {
                                MmbId: {
                                  type: 'string',
                                },
                              },
                              required: ['MmbId'],
                            },
                          },
                          required: ['ClrSysMmbId'],
                        },
                      },
                      required: ['FinInstnId'],
                    },
                  },
                  required: ['OrgnlInstrId', 'OrgnlEndToEndId', 'TxSts', 'ChrgsInf', 'AccptncDtTm', 'InstgAgt', 'InstdAgt'],
                },
              },
              required: ['GrpHdr', 'TxInfAndSts'],
            },
          },
        },
        else: {
          type: 'object',
          properties: {},
          if: {
            type: 'object',
            properties: {
              //
              TxTp: { type: 'string', enum: [pacs008] },
            },
          },
          then: {
            type: 'object',
            properties: {
              // pacs008
              TxTp: { type: 'string', enum: [pacs008] },
              FIToFICstmrCdtTrf: {
                type: 'object',
                properties: {
                  GrpHdr: {
                    type: 'object',
                    properties: {
                      MsgId: {
                        type: 'string',
                      },
                      CreDtTm: {
                        type: 'string',
                      },
                      NbOfTxs: {
                        type: 'number',
                      },
                      SttlmInf: {
                        type: 'object',
                        properties: {
                          SttlmMtd: {
                            type: 'string',
                          },
                        },
                        required: ['SttlmMtd'],
                      },
                    },
                    required: ['MsgId', 'CreDtTm', 'NbOfTxs', 'SttlmInf'],
                  },
                  CdtTrfTxInf: {
                    type: 'object',
                    properties: {
                      PmtId: {
                        type: 'object',
                        properties: {
                          InstrId: {
                            type: 'string',
                          },
                          EndToEndId: {
                            type: 'string',
                          },
                        },
                        required: ['InstrId', 'EndToEndId'],
                      },
                      IntrBkSttlmAmt: {
                        type: 'object',
                        properties: {
                          Amt: {
                            type: 'object',
                            properties: {
                              Amt: {
                                type: 'number',
                              },
                              Ccy: {
                                type: 'string',
                              },
                            },
                            required: ['Amt', 'Ccy'],
                          },
                        },
                        required: ['Amt'],
                      },
                      InstdAmt: {
                        type: 'object',
                        properties: {
                          Amt: {
                            type: 'object',
                            properties: {
                              Amt: {
                                type: 'number',
                              },
                              Ccy: {
                                type: 'string',
                              },
                            },
                            required: ['Amt', 'Ccy'],
                          },
                        },
                        required: ['Amt'],
                      },
                      ChrgBr: {
                        type: 'string',
                      },
                      ChrgsInf: {
                        type: 'object',
                        properties: {
                          Amt: {
                            type: 'object',
                            properties: {
                              Amt: {
                                type: 'number',
                              },
                              Ccy: {
                                type: 'string',
                              },
                            },
                            required: ['Amt', 'Ccy'],
                          },
                          Agt: {
                            type: 'object',
                            properties: {
                              FinInstnId: {
                                type: 'object',
                                properties: {
                                  ClrSysMmbId: {
                                    type: 'object',
                                    properties: {
                                      MmbId: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['MmbId'],
                                  },
                                },
                                required: ['ClrSysMmbId'],
                              },
                            },
                            required: ['FinInstnId'],
                          },
                        },
                        required: ['Amt', 'Agt'],
                      },
                      InitgPty: {
                        type: 'object',
                        properties: {
                          Nm: {
                            type: 'string',
                          },
                          Id: {
                            type: 'object',
                            properties: {
                              PrvtId: {
                                type: 'object',
                                properties: {
                                  DtAndPlcOfBirth: {
                                    type: 'object',
                                    properties: {
                                      BirthDt: {
                                        type: 'string',
                                      },
                                      CityOfBirth: {
                                        type: 'string',
                                      },
                                      CtryOfBirth: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['BirthDt', 'CityOfBirth', 'CtryOfBirth'],
                                  },
                                  Othr: {
                                    type: 'object',
                                    properties: {
                                      Id: {
                                        type: 'string',
                                      },
                                      SchmeNm: {
                                        type: 'object',
                                        properties: {
                                          Prtry: {
                                            type: 'string',
                                          },
                                        },
                                        required: ['Prtry'],
                                      },
                                    },
                                    required: ['Id', 'SchmeNm'],
                                  },
                                },
                                required: ['DtAndPlcOfBirth', 'Othr'],
                              },
                            },
                            required: ['PrvtId'],
                          },
                          CtctDtls: {
                            type: 'object',
                            properties: {
                              MobNb: {
                                type: 'string',
                              },
                            },
                            required: ['MobNb'],
                          },
                        },
                        required: ['Nm', 'Id', 'CtctDtls'],
                      },
                      Dbtr: {
                        type: 'object',
                        properties: {
                          Nm: {
                            type: 'string',
                          },
                          Id: {
                            type: 'object',
                            properties: {
                              PrvtId: {
                                type: 'object',
                                properties: {
                                  DtAndPlcOfBirth: {
                                    type: 'object',
                                    properties: {
                                      BirthDt: {
                                        type: 'string',
                                      },
                                      CityOfBirth: {
                                        type: 'string',
                                      },
                                      CtryOfBirth: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['BirthDt', 'CityOfBirth', 'CtryOfBirth'],
                                  },
                                  Othr: {
                                    type: 'object',
                                    properties: {
                                      Id: {
                                        type: 'string',
                                      },
                                      SchmeNm: {
                                        type: 'object',
                                        properties: {
                                          Prtry: {
                                            type: 'string',
                                          },
                                        },
                                        required: ['Prtry'],
                                      },
                                    },
                                    required: ['Id', 'SchmeNm'],
                                  },
                                },
                                required: ['DtAndPlcOfBirth', 'Othr'],
                              },
                            },
                            required: ['PrvtId'],
                          },
                          CtctDtls: {
                            type: 'object',
                            properties: {
                              MobNb: {
                                type: 'string',
                              },
                            },
                            required: ['MobNb'],
                          },
                        },
                        required: ['Nm', 'Id', 'CtctDtls'],
                      },
                      DbtrAcct: {
                        type: 'object',
                        properties: {
                          Id: {
                            type: 'object',
                            properties: {
                              Othr: {
                                type: 'object',
                                properties: {
                                  Id: {
                                    type: 'string',
                                  },
                                  SchmeNm: {
                                    type: 'object',
                                    properties: {
                                      Prtry: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['Prtry'],
                                  },
                                },
                                required: ['Id', 'SchmeNm'],
                              },
                            },
                            required: ['Othr'],
                          },
                          Nm: {
                            type: 'string',
                          },
                        },
                        required: ['Id', 'Nm'],
                      },
                      DbtrAgt: {
                        type: 'object',
                        properties: {
                          FinInstnId: {
                            type: 'object',
                            properties: {
                              ClrSysMmbId: {
                                type: 'object',
                                properties: {
                                  MmbId: {
                                    type: 'string',
                                  },
                                },
                                required: ['MmbId'],
                              },
                            },
                            required: ['ClrSysMmbId'],
                          },
                        },
                        required: ['FinInstnId'],
                      },
                      CdtrAgt: {
                        type: 'object',
                        properties: {
                          FinInstnId: {
                            type: 'object',
                            properties: {
                              ClrSysMmbId: {
                                type: 'object',
                                properties: {
                                  MmbId: {
                                    type: 'string',
                                  },
                                },
                                required: ['MmbId'],
                              },
                            },
                            required: ['ClrSysMmbId'],
                          },
                        },
                        required: ['FinInstnId'],
                      },
                      Cdtr: {
                        type: 'object',
                        properties: {
                          Nm: {
                            type: 'string',
                          },
                          Id: {
                            type: 'object',
                            properties: {
                              PrvtId: {
                                type: 'object',
                                properties: {
                                  DtAndPlcOfBirth: {
                                    type: 'object',
                                    properties: {
                                      BirthDt: {
                                        type: 'string',
                                      },
                                      CityOfBirth: {
                                        type: 'string',
                                      },
                                      CtryOfBirth: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['BirthDt', 'CityOfBirth', 'CtryOfBirth'],
                                  },
                                  Othr: {
                                    type: 'object',
                                    properties: {
                                      Id: {
                                        type: 'string',
                                      },
                                      SchmeNm: {
                                        type: 'object',
                                        properties: {
                                          Prtry: {
                                            type: 'string',
                                          },
                                        },
                                        required: ['Prtry'],
                                      },
                                    },
                                    required: ['Id', 'SchmeNm'],
                                  },
                                },
                                required: ['DtAndPlcOfBirth', 'Othr'],
                              },
                            },
                            required: ['PrvtId'],
                          },
                          CtctDtls: {
                            type: 'object',
                            properties: {
                              MobNb: {
                                type: 'string',
                              },
                            },
                            required: ['MobNb'],
                          },
                        },
                        required: ['Nm', 'Id', 'CtctDtls'],
                      },
                      CdtrAcct: {
                        type: 'object',
                        properties: {
                          Id: {
                            type: 'object',
                            properties: {
                              Othr: {
                                type: 'object',
                                properties: {
                                  Id: {
                                    type: 'string',
                                  },
                                  SchmeNm: {
                                    type: 'object',
                                    properties: {
                                      Prtry: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['Prtry'],
                                  },
                                },
                                required: ['Id', 'SchmeNm'],
                              },
                            },
                            required: ['Othr'],
                          },
                          Nm: {
                            type: 'string',
                          },
                        },
                        required: ['Id', 'Nm'],
                      },
                      Purp: {
                        type: 'object',
                        properties: {
                          Cd: {
                            type: 'string',
                          },
                        },
                        required: ['Cd'],
                      },
                    },
                    required: [
                      'PmtId',
                      'IntrBkSttlmAmt',
                      'InstdAmt',
                      'ChrgBr',
                      'ChrgsInf',
                      'InitgPty',
                      'Dbtr',
                      'DbtrAcct',
                      'DbtrAgt',
                      'CdtrAgt',
                      'Cdtr',
                      'CdtrAcct',
                      'Purp',
                    ],
                  },
                  RgltryRptg: {
                    type: 'object',
                    properties: {
                      Dtls: {
                        type: 'object',
                        properties: {
                          Tp: {
                            type: 'string',
                          },
                          Cd: {
                            type: 'string',
                          },
                        },
                        required: ['Tp', 'Cd'],
                      },
                    },
                    required: ['Dtls'],
                  },
                  RmtInf: {
                    type: 'object',
                    properties: {
                      Ustrd: {
                        type: 'string',
                      },
                    },
                    required: ['Ustrd'],
                  },
                  SplmtryData: {
                    type: 'object',
                    properties: {
                      Envlp: {
                        type: 'object',
                        properties: {
                          Doc: {
                            type: 'object',
                            properties: {
                              Xprtn: {
                                type: 'string',
                              },
                            },
                            required: ['Xprtn'],
                          },
                        },
                        required: ['Doc'],
                      },
                    },
                    required: ['Envlp'],
                  },
                },
                required: ['GrpHdr', 'CdtTrfTxInf', 'RgltryRptg', 'RmtInf', 'SplmtryData'],
              },
            },
          },
          else: {
            type: 'object',
            properties: {
              TxTp: {
                type: 'string',
              },
              CdtrPmtActvtnReq: {
                type: 'object',
                properties: {
                  GrpHdr: {
                    type: 'object',
                    properties: {
                      MsgId: {
                        type: 'string',
                      },
                      CreDtTm: {
                        type: 'string',
                      },
                      NbOfTxs: {
                        type: 'number',
                      },
                      InitgPty: {
                        type: 'object',
                        properties: {
                          Nm: {
                            type: 'string',
                          },
                          Id: {
                            type: 'object',
                            properties: {
                              PrvtId: {
                                type: 'object',
                                properties: {
                                  DtAndPlcOfBirth: {
                                    type: 'object',
                                    properties: {
                                      BirthDt: {
                                        type: 'string',
                                      },
                                      CityOfBirth: {
                                        type: 'string',
                                      },
                                      CtryOfBirth: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['BirthDt', 'CityOfBirth', 'CtryOfBirth'],
                                  },
                                  Othr: {
                                    type: 'object',
                                    properties: {
                                      Id: {
                                        type: 'string',
                                      },
                                      SchmeNm: {
                                        type: 'object',
                                        properties: {
                                          Prtry: {
                                            type: 'string',
                                          },
                                        },
                                        required: ['Prtry'],
                                      },
                                    },
                                    required: ['Id', 'SchmeNm'],
                                  },
                                },
                                required: ['DtAndPlcOfBirth', 'Othr'],
                              },
                            },
                            required: ['PrvtId'],
                          },
                          CtctDtls: {
                            type: 'object',
                            properties: {
                              MobNb: {
                                type: 'string',
                              },
                            },
                            required: ['MobNb'],
                          },
                        },
                        required: ['Nm', 'Id', 'CtctDtls'],
                      },
                    },
                    required: ['MsgId', 'CreDtTm', 'NbOfTxs', 'InitgPty'],
                  },
                  PmtInf: {
                    type: 'object',
                    properties: {
                      PmtInfId: {
                        type: 'string',
                      },
                      PmtMtd: {
                        type: 'string',
                      },
                      ReqdAdvcTp: {
                        type: 'object',
                        properties: {
                          DbtAdvc: {
                            type: 'object',
                            properties: {
                              Cd: {
                                type: 'string',
                              },
                              Prtry: {
                                type: 'string',
                              },
                            },
                            required: ['Cd', 'Prtry'],
                          },
                        },
                        required: ['DbtAdvc'],
                      },
                      ReqdExctnDt: {
                        type: 'object',
                        properties: {
                          DtTm: {
                            type: 'string',
                          },
                        },
                        required: ['DtTm'],
                      },
                      XpryDt: {
                        type: 'object',
                        properties: {
                          DtTm: {
                            type: 'string',
                          },
                        },
                        required: ['DtTm'],
                      },
                      Dbtr: {
                        type: 'object',
                        properties: {
                          Nm: {
                            type: 'string',
                          },
                          Id: {
                            type: 'object',
                            properties: {
                              PrvtId: {
                                type: 'object',
                                properties: {
                                  DtAndPlcOfBirth: {
                                    type: 'object',
                                    properties: {
                                      BirthDt: {
                                        type: 'string',
                                      },
                                      CityOfBirth: {
                                        type: 'string',
                                      },
                                      CtryOfBirth: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['BirthDt', 'CityOfBirth', 'CtryOfBirth'],
                                  },
                                  Othr: {
                                    type: 'object',
                                    properties: {
                                      Id: {
                                        type: 'string',
                                      },
                                      SchmeNm: {
                                        type: 'object',
                                        properties: {
                                          Prtry: {
                                            type: 'string',
                                          },
                                        },
                                        required: ['Prtry'],
                                      },
                                    },
                                    required: ['Id', 'SchmeNm'],
                                  },
                                },
                                required: ['DtAndPlcOfBirth', 'Othr'],
                              },
                            },
                            required: ['PrvtId'],
                          },
                          CtctDtls: {
                            type: 'object',
                            properties: {
                              MobNb: {
                                type: 'string',
                              },
                            },
                            required: ['MobNb'],
                          },
                        },
                        required: ['Nm', 'Id', 'CtctDtls'],
                      },
                      DbtrAcct: {
                        type: 'object',
                        properties: {
                          Id: {
                            type: 'object',
                            properties: {
                              Othr: {
                                type: 'object',
                                properties: {
                                  Id: {
                                    type: 'string',
                                  },
                                  SchmeNm: {
                                    type: 'object',
                                    properties: {
                                      Prtry: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['Prtry'],
                                  },
                                },
                                required: ['Id', 'SchmeNm'],
                              },
                            },
                            required: ['Othr'],
                          },
                          Nm: {
                            type: 'string',
                          },
                        },
                        required: ['Id', 'Nm'],
                      },
                      DbtrAgt: {
                        type: 'object',
                        properties: {
                          FinInstnId: {
                            type: 'object',
                            properties: {
                              ClrSysMmbId: {
                                type: 'object',
                                properties: {
                                  MmbId: {
                                    type: 'string',
                                  },
                                },
                                required: ['MmbId'],
                              },
                            },
                            required: ['ClrSysMmbId'],
                          },
                        },
                        required: ['FinInstnId'],
                      },
                      CdtTrfTxInf: {
                        type: 'object',
                        properties: {
                          PmtId: {
                            type: 'object',
                            properties: {
                              EndToEndId: {
                                type: 'string',
                              },
                            },
                            required: ['EndToEndId'],
                          },
                          PmtTpInf: {
                            type: 'object',
                            properties: {
                              CtgyPurp: {
                                type: 'object',
                                properties: {
                                  Prtry: {
                                    type: 'string',
                                  },
                                },
                                required: ['Prtry'],
                              },
                            },
                            required: ['CtgyPurp'],
                          },
                          Amt: {
                            type: 'object',
                            properties: {
                              InstdAmt: {
                                type: 'object',
                                properties: {
                                  Amt: {
                                    type: 'object',
                                    properties: {
                                      Amt: {
                                        type: 'number',
                                      },
                                      Ccy: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['Amt', 'Ccy'],
                                  },
                                },
                                required: ['Amt'],
                              },
                              EqvtAmt: {
                                type: 'object',
                                properties: {
                                  Amt: {
                                    type: 'object',
                                    properties: {
                                      Amt: {
                                        type: 'number',
                                      },
                                      Ccy: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['Amt', 'Ccy'],
                                  },
                                  CcyOfTrf: {
                                    type: 'string',
                                  },
                                },
                                required: ['Amt', 'CcyOfTrf'],
                              },
                            },
                            required: ['InstdAmt', 'EqvtAmt'],
                          },
                          ChrgBr: {
                            type: 'string',
                          },
                          CdtrAgt: {
                            type: 'object',
                            properties: {
                              FinInstnId: {
                                type: 'object',
                                properties: {
                                  ClrSysMmbId: {
                                    type: 'object',
                                    properties: {
                                      MmbId: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['MmbId'],
                                  },
                                },
                                required: ['ClrSysMmbId'],
                              },
                            },
                            required: ['FinInstnId'],
                          },
                          Cdtr: {
                            type: 'object',
                            properties: {
                              Nm: {
                                type: 'string',
                              },
                              Id: {
                                type: 'object',
                                properties: {
                                  PrvtId: {
                                    type: 'object',
                                    properties: {
                                      DtAndPlcOfBirth: {
                                        type: 'object',
                                        properties: {
                                          BirthDt: {
                                            type: 'string',
                                          },
                                          CityOfBirth: {
                                            type: 'string',
                                          },
                                          CtryOfBirth: {
                                            type: 'string',
                                          },
                                        },
                                        required: ['BirthDt', 'CityOfBirth', 'CtryOfBirth'],
                                      },
                                      Othr: {
                                        type: 'object',
                                        properties: {
                                          Id: {
                                            type: 'string',
                                          },
                                          SchmeNm: {
                                            type: 'object',
                                            properties: {
                                              Prtry: {
                                                type: 'string',
                                              },
                                            },
                                            required: ['Prtry'],
                                          },
                                        },
                                        required: ['Id', 'SchmeNm'],
                                      },
                                    },
                                    required: ['DtAndPlcOfBirth', 'Othr'],
                                  },
                                },
                                required: ['PrvtId'],
                              },
                              CtctDtls: {
                                type: 'object',
                                properties: {
                                  MobNb: {
                                    type: 'string',
                                  },
                                },
                                required: ['MobNb'],
                              },
                            },
                            required: ['Nm', 'Id', 'CtctDtls'],
                          },
                          CdtrAcct: {
                            type: 'object',
                            properties: {
                              Id: {
                                type: 'object',
                                properties: {
                                  Othr: {
                                    type: 'object',
                                    properties: {
                                      Id: {
                                        type: 'string',
                                      },
                                      SchmeNm: {
                                        type: 'object',
                                        properties: {
                                          Prtry: {
                                            type: 'string',
                                          },
                                        },
                                        required: ['Prtry'],
                                      },
                                    },
                                    required: ['Id', 'SchmeNm'],
                                  },
                                },
                                required: ['Othr'],
                              },
                              Nm: {
                                type: 'string',
                              },
                            },
                            required: ['Id', 'Nm'],
                          },
                          Purp: {
                            type: 'object',
                            properties: {
                              Cd: {
                                type: 'string',
                              },
                            },
                            required: ['Cd'],
                          },
                          RgltryRptg: {
                            type: 'object',
                            properties: {
                              Dtls: {
                                type: 'object',
                                properties: {
                                  Tp: {
                                    type: 'string',
                                  },
                                  Cd: {
                                    type: 'string',
                                  },
                                },
                                required: ['Tp', 'Cd'],
                              },
                            },
                            required: ['Dtls'],
                          },
                          SplmtryData: {
                            type: 'object',
                            properties: {
                              Envlp: {
                                type: 'object',
                                properties: {
                                  Doc: {
                                    type: 'object',
                                    properties: {
                                      PyeeRcvAmt: {
                                        type: 'object',
                                        properties: {
                                          Amt: {
                                            type: 'object',
                                            properties: {
                                              Amt: {
                                                type: 'number',
                                              },
                                              Ccy: {
                                                type: 'string',
                                              },
                                            },
                                            required: ['Amt', 'Ccy'],
                                          },
                                        },
                                        required: ['Amt'],
                                      },
                                      PyeeFinSvcsPrvdrFee: {
                                        type: 'object',
                                        properties: {
                                          Amt: {
                                            type: 'object',
                                            properties: {
                                              Amt: {
                                                type: 'number',
                                              },
                                              Ccy: {
                                                type: 'string',
                                              },
                                            },
                                            required: ['Amt', 'Ccy'],
                                          },
                                        },
                                        required: ['Amt'],
                                      },
                                      PyeeFinSvcsPrvdrComssn: {
                                        type: 'object',
                                        properties: {
                                          Amt: {
                                            type: 'object',
                                            properties: {
                                              Amt: {
                                                type: 'number',
                                              },
                                              Ccy: {
                                                type: 'string',
                                              },
                                            },
                                            required: ['Amt', 'Ccy'],
                                          },
                                        },
                                        required: ['Amt'],
                                      },
                                    },
                                    required: ['PyeeRcvAmt', 'PyeeFinSvcsPrvdrFee', 'PyeeFinSvcsPrvdrComssn'],
                                  },
                                },
                                required: ['Doc'],
                              },
                            },
                            required: ['Envlp'],
                          },
                        },
                        required: [
                          'PmtId',
                          'PmtTpInf',
                          'Amt',
                          'ChrgBr',
                          'CdtrAgt',
                          'Cdtr',
                          'CdtrAcct',
                          'Purp',
                          'RgltryRptg',
                          'SplmtryData',
                        ],
                      },
                    },
                    required: ['PmtInfId', 'PmtMtd', 'ReqdAdvcTp', 'ReqdExctnDt', 'XpryDt', 'Dbtr', 'DbtrAcct', 'DbtrAgt', 'CdtTrfTxInf'],
                  },
                  SplmtryData: {
                    type: 'object',
                    properties: {
                      Envlp: {
                        type: 'object',
                        properties: {
                          Doc: {
                            type: 'object',
                            properties: {
                              InitgPty: {
                                type: 'object',
                                properties: {
                                  Glctn: {
                                    type: 'object',
                                    properties: {
                                      Lat: {
                                        type: 'string',
                                      },
                                      Long: {
                                        type: 'string',
                                      },
                                    },
                                    required: ['Lat', 'Long'],
                                  },
                                },
                                required: ['Glctn'],
                              },
                            },
                            required: ['InitgPty'],
                          },
                        },
                        required: ['Doc'],
                      },
                    },
                    required: ['Envlp'],
                  },
                },
                required: ['GrpHdr', 'PmtInf', 'SplmtryData'],
              },
            },
            // pain013
          },
        },
      },
      required: [],
    },
    report: {
      type: 'object',
      properties: {
        evaluationID: {
          type: 'string',
        },
        metaData: {
          $ref: '#/definitions/metaData',
        },
        status: {
          type: 'string',
        },
        timestamp: {
          type: 'string',
        },
        tadpResult: {
          $ref: '#/definitions/tadpResult',
        },
      },
      required: ['evaluationID', 'metaData', 'status', 'timestamp', 'tadpResult'],
    },
  },
  required: ['transaction'],
};

export const messageSchemaInstant = fastJson({
  title: 'MessageSchema',
  ...messageSchema.definitions,
});
