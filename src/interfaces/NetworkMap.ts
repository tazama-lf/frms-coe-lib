// SPDX-License-Identifier: Apache-2.0

export interface Rule {
  id: string;
  cfg: string;
}

export interface Typology {
  id: string;
  cfg: string;
  rules: Rule[];
}

export interface Message {
  id: string;
  cfg: string;
  txTp: string;
  typologies: Typology[];
}

export interface NetworkMap {
  active: boolean;
  cfg: string;
  tenantId: string;
  messages: Message[];
}
