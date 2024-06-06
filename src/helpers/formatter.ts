// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatError = (error: Error, additionalInfo?: Record<string, any>): string => {
  const { name, message, stack } = error;
  const timestamp = new Date().toISOString();

  let formattedError = '\n--- Error Details ---\n';
  formattedError += `Name: ${name}\n`;
  formattedError += `Message: ${message}\n`;
  formattedError += `Timestamp: ${timestamp}\n`;

  if (stack) {
    formattedError += `Stack Trace:\n${stack}\n`;
  }

  if (additionalInfo) {
    formattedError += `Additional Info:\n${JSON.stringify(additionalInfo, null, 2)}\n`;
  }

  return formattedError;
};
