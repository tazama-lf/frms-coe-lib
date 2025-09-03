// SPDX-License-Identifier: Apache-2.0

export class Rule {
  id = '';
  cfg = '';
  host = '';
  typologies: Typology[] = [];

  getStrValue(): string {
    return `${this.id}${this.cfg}`;
  }
}

export class Typology {
  id = '';
  tenantId = '';
  host = '';
  cfg = '';
  desc = '';
  rules: Rule[] = [];

  constructor(typologyId: string, cfg: string, host: string) {
    this.id = typologyId;
    this.cfg = cfg;
    this.host = host;
  }
}

export class Message {
  id = '';
  host = '';
  cfg = '';
  txTp = '';
  typologies: Typology[] = [];
}

export class NetworkMap {
  active = false;
  cfg = '';
  tenantId = 'DEFAULT';
  messages: Message[] = [];
}
