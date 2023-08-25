const pain013Schema = {
  $id: 'pain013Schema',
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
              type: 'integer',
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
                            PyeeFinSvcsPrvdrFee: {
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
                            PyeeFinSvcsPrvdrComssn: {
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
              required: ['PmtId', 'PmtTpInf', 'Amt', 'ChrgBr', 'CdtrAgt', 'Cdtr', 'CdtrAcct', 'Purp', 'RgltryRptg', 'SplmtryData'],
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
  required: ['TxTp', 'CdtrPmtActvtnReq'],
};

export default pain013Schema;
export const pain013SchemaResponse = {
  '2xx': {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
      data: { $ref: 'pain013Schema#' },
    },
    required: ['message', 'data'],
  },
};
