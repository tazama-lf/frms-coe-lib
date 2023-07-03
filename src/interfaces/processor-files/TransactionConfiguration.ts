export class Typology {
  id = '';
  cfg = '';
  threshold = 0;
}

export class Channel {
  id = '';
  cfg = '';
  typologies: Typology[] = [];
}

export class Message {
  id = '';
  cfg = '';
  txTp = '';
  channels: Channel[] = [];
}

export class TransactionConfiguration {
  messages: Message[] = [];
}
