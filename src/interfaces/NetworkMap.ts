/* eslint-disable */
export class Rule {
  id = '';
  cfg = '';
  host = '';
  typologies: Array<Typology> = [];

  getStrValue(): string {
    return `${this.id}${this.cfg}`;
  }
}

export class Typology {
  id = '';
  host = '';
  cfg = '';
  desc = '';
  rules: Array<Rule> = [];

  constructor(typology_id: string, cfg: string, host: string) {
    this.id = typology_id;
    this.cfg = cfg;
    this.host = host;
  }
}

export class Channel {
  id = '';
  host = '';
  cfg = '';
  typologies: Array<Typology> = [];
}

export class Message {
  id = '';
  host = '';
  cfg = '';
  txTp = '';
  channels: Array<Channel> = [];
}

export class NetworkMap {
  active = false;
  cfg = '';
  messages: Array<Message> = [];
}
