// SPDX-License-Identifier: Apache-2.0


/**
 * Interface for transport plugins used in the relay service.
 * In order for the relay-service to work with different transport mechanisms,
 * plugins must implement this interface, in order for the plugins to be relay-service compliant.
 * This interface defines the methods required for initializing the plugin
 * and relaying data through the transport mechanism.
 */
export interface ITransportPlugin {
  /**
   * Initializes the transport plugin.
   * This function is called to set up the transport mechanism (i.e., connecting to a server, setting up listeners, etc.).
   * It should prepare the plugin to relay data.
   * @returns A promise that resolves when initialization is complete.
   */
  init: () => Promise<void>;
  
  /**
   * Relays data through the transport mechanism.
   * This function is responsible for sending data over the transport layer.
   * It should handle both Uint8Array and string data types.
   * @param data - The data to relay, either as a Uint8Array or string.
   * @returns A promise that resolves when the relay operation is complete.
   */
  relay: (data: Uint8Array | string) => Promise<void>;
}