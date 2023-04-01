import schema from "./schema.js";
import { resolver } from "./types.js";

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

/**
 * Encode asset data object.
 * @param {} type  Object type name.
 * @param {*} data JSON data object.
 * @returns Buffers with encoded asset.
 */
export function encodeAsset(type, data) {
  const resolve = resolver(schema);
  return resolve(type).encode(data, 0);
}
