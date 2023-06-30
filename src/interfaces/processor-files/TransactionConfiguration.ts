export class Typology {
    id = '';
    cfg = '';
    threshold = 0;
}

export class Channel {
    id = '';
    cfg = '';
    typologies: Array<Typology> = [];
}

export class Message {
    id = '';
    cfg = '';
    txTp = '';
    channels: Array<Channel> = [];
}

export class TransactionConfiguration {
    messages: Array<Message> = [];
}