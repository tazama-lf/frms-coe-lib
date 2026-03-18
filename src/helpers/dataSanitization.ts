// SPDX-License-Identifier: Apache-2.0

/**
 * Sanitizes sensitive data patterns in a string payload
 * @param payload - The string payload to sanitize
 * @returns The sanitized payload with sensitive data redacted
 */
export function sanitizeSensitiveData(payload: string): string {
  if (typeof payload !== 'string') return payload;

  return (
    payload
      // Credit card numbers (various patterns)
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-XXXX-XXXX')
      // Social security numbers
      .replace(/\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g, 'XXX-XX-XXXX')
      // Email addresses
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL_REDACTED]')
      // Phone numbers (various patterns)
      .replace(/\b(?:\+?1[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g, '[PHONE_REDACTED]')
      // Account numbers (context-aware patterns to avoid redacting amounts, dates, IDs)
      .replace(/(["']?(?:account|acct)(?:_?(?:number|num|no|id))?["']?\s*:\s*["']?)\d{8,}(["']?)/gi, '$1[ACCOUNT_REDACTED]$2')
      .replace(/(["']?(?:iban|bban)["']?\s*:\s*["']?)([A-Z]{2}\d{2}[A-Z0-9]{4,})(["']?)/gi, '$1[ACCOUNT_REDACTED]$3')
      // Common password fields in JSON
      .replace(/(["']?password["']?\s*:\s*["'])[^"']*(["'])/gi, '$1[REDACTED]$2')
      .replace(/(["']?pin["']?\s*:\s*["'])[^"']*(["'])/gi, '$1[REDACTED]$2')
      .replace(/(["']?secret["']?\s*:\s*["'])[^"']*(["'])/gi, '$1[REDACTED]$2')
      .replace(/(["']?token["']?\s*:\s*["'])[^"']*(["'])/gi, '$1[REDACTED]$2')
  );
}
