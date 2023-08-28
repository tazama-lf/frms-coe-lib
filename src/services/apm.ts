import apm, { type TransactionOptions } from 'elastic-apm-node';
import { type ApmConfig } from '../interfaces/apm';

export class Apm {
  #transaction: (name: string, options?: TransactionOptions) => apm.Transaction | null = () => null;
  #span: (name: string) => apm.Span | null = () => null;
  #traceParent: () => string | null = () => null;

  constructor(apmOptions?: ApmConfig) {
    const apmEnabled = apmOptions && apmOptions.active;
    if (apmEnabled) {
      const { serviceName, secretToken, serverUrl, usePathAsTransactionName } = apmOptions;

      apm.start({
        serviceName,
        secretToken,
        serverUrl,
        usePathAsTransactionName,
        active: apmEnabled,
      });

      this.#transaction = (name: string, options?: TransactionOptions): apm.Transaction | null => apm.startTransaction(name, options);
      this.#span = (name: string): apm.Span | null => apm.startSpan(name);
      this.#traceParent = (): string | null => apm.currentTraceparent;
    }
  }

  startTransaction = (name: string, options?: TransactionOptions): apm.Transaction | null => {
    return this.#transaction(name, options);
  };

  startSpan = (name: string): apm.Span | null => {
    return this.#span(name);
  };

  getCurrentTraceparent = (): string | null => {
    return this.#traceParent();
  };
}
