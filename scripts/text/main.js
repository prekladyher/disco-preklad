/**
 * PO comment field orer.
 */
const COMMENT_TYPES = ["#", "#.", "#:", "#,", "#|"];

/**
 * PO field order (without plural forms).
 */
const FIELD_TYPES = ["msgctxt", "msgid", "msgstr"];

/**
 * Encode PO file entries.
 * @param {*} entries PO file entries.
 * @returns Encded entries.
 */
export function encodeEntries(entries) {
  return entries.map(entry => encodeEntry(entry)).join("\n\n");
}

function encodeEntry(entry, wrap) {
  const result = [];
  for (let type of COMMENT_TYPES) {
    if (entry[type] !== undefined) {
      entry[type].split('\n').forEach(line => result.push(`${type} ${line}`));
    }
  }
  for (let attr of FIELD_TYPES) {
    if (entry[attr] !== undefined) {
      result.push(`${attr} ${wrapValue(entry[attr], attr === "msgstr")}`);
    }
  }
  return result.join('\n');
}

function wrapValue(value, force = false) {
  if (value === "") {
    return `""`;
  }
  let lines = [];
  let start = 0;
  let end = value.indexOf("\n");
  while (end >= 0 && end + 1 < value.length) {
    lines.push(JSON.stringify(value.slice(start, end)).slice(0, -1) + `\\n"`);
    start = end + 1;
    end = value.indexOf("\n", start);
  }
  lines.push(JSON.stringify(value.substring(start)));
  return lines.length > 1 || force ? `""\n${lines.join("\n")}` : lines[0];
}

/**
 * Decode PO file content.
 * @param {string} content
 * @returns Array of decoded PO entries.
 */
export function decodeEntries(content) {
  const entries = content.trim().split(/\r?\n\r?\n+/m);
  return entries.map(entry => decodeEntry(entry));
}

function decodeEntry(entry) {
  const result = {};
  const fields = [];
  for (let line of  entry.split(/\r?\n/)) {
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
