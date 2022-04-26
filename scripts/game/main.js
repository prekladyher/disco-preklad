import { resolver } from "./types.js";
import schema from "./schema.js";

/**
 * Decode asset data object.
 * @param {string} type Object type name.
 * @param {Buffer} data Buffer with asset data.
 * @returns Decoded result asset object.
 */
export function decodeAsset(type, data) {
  const resolve = resolver(schema);
  return resolve(type).decode(data, 0)[1];
}
