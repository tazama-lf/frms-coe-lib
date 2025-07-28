// SPDX-License-Identifier: Apache-2.0
import type { DatabaseManagerType } from '../services/dbManager';

/**
 * Updates the expiry date and time (`xprtnDtTm`) of an edge document in the specified collection,
 * after verifying that the document exists and belongs to the provided tenant.
 *
 * @param manager - The database manager instance used to access the collection.
 * @param collectionName - The name of the collection containing the edge document.
 * @param edgeKey - The unique key identifying the edge document to update.
 * @param expireDateTime - The new expiry date and time to set on the edge document.
 * @param tenantId - The tenant ID to verify ownership of the edge document.
 * @returns A promise resolving to the updated document if successful, or throws an error if unauthorized or not found.
 * @throws {Error} If the collection name is undefined, the edge key is missing, or the tenant does not match.
 */
export const updateEdgeExpiry = async (
  manager: DatabaseManagerType,
  collectionName: string,
  edgeKey: string,
  expireDateTime: string,
  tenantId: string,
): Promise<unknown> => {
  if (!collectionName) {
    throw new Error('Collection is undefined');
  }

  if (!edgeKey) return undefined;

  const collection = manager._pseudonymsDb?.collection(collectionName);
  const record = (await collection?.document(edgeKey)) as { tenantId: string } | undefined;

  if (!record || record.tenantId !== tenantId) {
    throw new Error(`Unauthorized: Cannot update edge ${edgeKey}. Tenant mismatch or record not found.`);
  }

  return await collection?.update(edgeKey, { xprtnDtTm: expireDateTime }, { returnNew: true });
};
