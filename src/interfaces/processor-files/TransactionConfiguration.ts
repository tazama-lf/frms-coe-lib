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

export class TransactionConfiguration {
  id = '';
  cfg = '';
  txTp = '';
  channels: Channel[] = [];
}
