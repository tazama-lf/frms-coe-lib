// SPDX-License-Identifier: Apache-2.0

import { NetworkMap } from '../../interfaces';

export const NetworkMapSample: NetworkMap[] = [
  {
    active: true,
    cfg: '',
    messages: [
      {
        id: '001@1.0',
        cfg: '1.0',
        txTp: 'pain.001.001.11',
        typologies: [
          {
            id: '028@1.0',
            cfg: '1.0',
            rules: [
              { id: '003@1.0', cfg: '1.0' },
              { id: '028@1.0', cfg: '1.0' },
            ],
          },
        ],
      },
      {
        id: '002@1.0',
        cfg: '1.0',
        txTp: 'pain.013.001.09',
        typologies: [
          {
            id: '030@1.0',
            cfg: '1.0',
            rules: [
              { id: '003@1.0', cfg: '1.0' },
              { id: '028@1.0', cfg: '1.0' },
            ],
          },
          {
            id: '031@1.0',
            cfg: '1.0',
            rules: [
              { id: '003@1.0', cfg: '1.0' },
              { id: '028@1.0', cfg: '1.0' },
            ],
          },
        ],
      },
      {
        id: '004@1.0.0',
        cfg: '1.0.0',
        txTp: 'pacs.002.001.12',
        typologies: [
          {
            id: '028@1.0.0',
            cfg: '1.0.0',
            rules: [{ id: '018@1.0', cfg: '1.0.0' }],
          },
        ],
      },
      {
        id: '005@1.0.0',
        cfg: '1.0.0',
        txTp: 'pacs.008.001.10',
        typologies: [
          {
            id: '028@1.0.0',
            cfg: '1.0.0',
            rules: [{ id: '018@1.0', cfg: '1.0.0' }],
          },
        ],
      },
    ],
  },
];
