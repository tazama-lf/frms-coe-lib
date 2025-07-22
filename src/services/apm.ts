// SPDX-License-Identifier: Apache-2.0

import apm, { type AgentConfigOptions, type TransactionOptions } from 'elastic-apm-node';
import { validateAPMConfig } from '../config/monitoring.config';

export class Apm {
  readonly #transaction: (name: string, options?: TransactionOptions) => apm.Transaction | null = () => null;
  readonly #span: (name: string) => apm.Span | null = () => null;
  readonly #traceParent: () => string | null = () => null;

  constructor(apmConfig?: AgentConfigOptions) {
    const config = validateAPMConfig();
    if (config.apmActive) {
      const apmOptions: AgentConfigOptions = {
        active: config.apmActive,
        secretToken: config.apmSecretToken,
        serviceName: config.apmServiceName,
        serverUrl: config.apmUrl,
        ...apmConfig,
      };
      apm.start(apmOptions);
      this.#transaction = (name: string, options?: TransactionOptions): apm.Transaction | null => apm.startTransaction(name, options);
      this.#span = (name: string): apm.Span | null => apm.startSpan(name);
      this.#traceParent = (): string | null => apm.currentTraceparent;
    }
  }

  startTransaction = (name: string, options?: TransactionOptions): apm.Transaction | null => this.#transaction(name, options);

  startSpan = (name: string): apm.Span | null => this.#span(name);

  getCurrentTraceparent = (): string | null => this.#traceParent();
}
