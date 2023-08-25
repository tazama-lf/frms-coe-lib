const pacs008Schema = {
  $id: 'pacs008Schema',
  type: 'object',
  properties: {
    TxTp: {
      type: 'string',
    },
    FIToFICstmrCdt: {
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
              type: 'integer',
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
                      type: 'integer',
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
                      type: 'integer',
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
  required: ['TxTp', 'FIToFICstmrCdt'],
};

export default pacs008Schema;
export const pacs008SchemaResponse = {
  '2xx': {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
      data: { $ref: 'pacs008Schema#' },
    },
    required: ['message', 'data'],
  },
};
