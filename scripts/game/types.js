/**
 * @callback DecodeFn
 * @param {Buffer} buffer
 * @param {number} offset
 * @return {[ number, * ]}
 */
/**
 * @callback EncodeFn
 * @param {*} value
 * @return {Buffer[]}
 */
/**
 * @typedef {{ decode: DecodeFn, encode: EncodeFn }} Type
 */
/**
 * @callback TypeResolver
 * @param {string} key
 * @return {Type}
 */

/**
 * @return {TypeResolver}
 */
export function resolver(schema) {
  const factory = (key) => {
    if (key.endsWith("[]")) {
      return arrayType(factory(key.substring(0, key.length - 2)));
    }
    const def = schema[key];
    if (def) {
      return Array.isArray(def) ? structType(def, factory) : objectType(def, factory);
    }
    switch (key) {
      case "int": return nativeType(4, "Int32LE");
      case "uint8": return nativeType(1, "UInt8");
      case "uint32": return nativeType(4, "UInt32LE");
      case "uint64": return nativeType(8, "BigUInt64LE", BigInt);
      case "float": return nativeType(4, "FloatLE");
      case "string": return stringType();
      default:
        throw new Error(`Unable to resolve type: ${key}`);
    }
  };
  return factory;
}

/** @return {Type} */
export function nativeType(size, type, convert = null) {
  const decoder = Buffer.prototype["read" + type];
  const encoder = Buffer.prototype["write" + type];
  return {
    decode: (buffer, offset) => [size, decoder.call(buffer, offset)],
    encode: (value) => {
      const buffer = Buffer.alloc(size);
      encoder.call(buffer, convert ? convert(value) : value);
      return [buffer];
    }
  };
}

function padding(dataLength, blockLength = 4) {
  return (blockLength - (dataLength % blockLength)) % blockLength;
}

/** @return {Type} */
export function stringType() {
  return {
    decode: (buffer, offset) => {
      const length = buffer.readUInt32LE(offset);
      return [
        4 + length + padding(length),
        buffer.toString("utf8", offset + 4, offset + 4 + length)
      ];
    },
    encode: (value) => {
      const string = Buffer.from(value);
      const length = Buffer.alloc(4);
      length.writeUInt32LE(string.length);
      return [length, string, Buffer.alloc(padding(string.length))];
    }
  };
}

/**
 * @param {Type} type
 * @return {Type}
 */
export function arrayType(itemType) {
  return {
    decode: (buffer, offset) => {
      const length = buffer.readUInt32LE(offset);
      let bytes = 4;
      const result = [];
      for (let i = 0; i < length; i++) {
        const [size, value] = itemType.decode(buffer, offset + bytes);
        bytes += size;
        result.push(value);
      }
      return [bytes + padding(bytes), result];
    },
    encode: (value) => {
      const length = Buffer.alloc(4);
      length.writeUInt32LE(value.length);
      const buffers = [length];
      for (let item of value) {
        buffers.push(...itemType.encode(item));
      }
      buffers.push(Buffer.alloc(padding(buffers.reduce((acc, buf) => acc + buf.length, 0))));
      return buffers;
    }
  };
}

function assertValue(property, actual, offset) {
  if (property.assert && !property.assert(actual)) {
    const name = property.name || "unnamed";
    throw Error(`Unexpected ${name} value: ${actual} at offset: ${offset}`);
  }
  if (property.value !== undefined && property.value !== actual) {
    const name = property.name || "unnamed";
    throw Error(`Unexpected ${name} value: ${actual} at offset: ${offset} (expected: ${property.value})`);
  }
}

/**
 * @param {*} schema
 * @param {TypeResolver} resolve
 * @return {Type}
 */
export function structType(schema, resolve) {
  return {
    decode: (buffer, offset) => {
      let bytes = 0;
      const result = {};
      for (let property of schema) {
        const [size, value] = resolve(property.type).decode(buffer, offset + bytes);
        assertValue(property, value, offset + bytes);
        bytes += size + padding(size);
        if (property.name) {
          result[property.name] = value;
        }
      }
      return [bytes, result];
    },
    encode: (struct) => {
      return schema.flatMap((property) => {
        const value = property.name in struct ? struct[property.name] : property.value;
        const buffers = resolve(property.type).encode(value);
        const length = buffers.reduce((acc, buf) => acc + buf.length, 0);
        return length % 4 ? [Buffer.concat(buffers), Buffer.alloc(padding(length))] : buffers;
      });
    }
  };
}

/**
 * @param {*} schema
 * @param {TypeResolver} resolve
 * @return {Type}
 */
export function objectType(schema, resolve) {
  const subtype = structType(schema.struct, resolve);
  return {
    decode: (buffer, offset) => {
      const [bytes, value] = subtype.decode(buffer, offset);
      return [bytes, schema.decode(value)];
    },
    encode: (value) => {
      return subtype.encode(schema.encode(value));
    }
  };
}
