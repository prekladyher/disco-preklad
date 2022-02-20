

/**
 * PO comment field orer.
 */
const COMMENT_TYPES = ["#", "#.", "#:", "#,", "#|"];

/**
 * PO field order (without plural forms).
 */
const FIELD_TYPES = ["msgctx", "msgid", "msgstr"];

/**
 * Encode PO file entries.
 * @param {*} entries PO file entries.
 * @returns Encded entries.
 */
export function encodeEntries(entries) {
  return entries.map(entry => encodeEntry(entry)).join("\n\n");
}

function encodeEntry(entry) {
  const result = [];
  for (let type of COMMENT_TYPES) {
    if (entry[type] !== undefined) {
      entry[type].split('\n').forEach(line => result.push(`${type} ${line}`));
    }
  }
  for (let attr of FIELD_TYPES) {
    if (entry[attr] !== undefined) {
      result.push(`${attr} ${JSON.stringify(entry[attr]).split("\\n").join("\\n\"\n\"")}`);
    }
  }
  return result.join('\n');
}

/**
 * Decode PO file content.
 * @param {string} content
 * @returns Array of decoded PO entries.
 */
export function decodeEntries(content) {
  const entries = content.trim().split(/\n\n+/m);
  return entries.map(entry => decodeEntry(entry));
}

function decodeEntry(entry) {
  const result = {};
  const fields = [];
  for (let line of  entry.split(/\n/)) {
    if (line[0] === "\"") {
      fields[fields.length - 1][1] += JSON.parse(line);
      continue;
    }
    const idx = line.indexOf(" ");
    if (idx < 0) {
      continue; // ignore invalid line
    }
    const type = line.substring(0, idx);
    const value = line.substring(idx + 1);
    if (line[0] === "#") {
      result[type] = result[type] !== undefined ? `${result[type]}\n${value}` : value;
    } else {
      fields.push([type, JSON.parse(value)]);
    }
  }
  return { ...result, ...Object.fromEntries(fields) };
}
