import { encodeEntries, decodeEntries } from  "./main.js";

describe("PO file library", function() {

  const TEST_ENTRY = {
    "#": "This is\nmultiline comment",
    "#,": "fuzzy",
    "msgctxt": "simple attribute",
    "msgid": "multiline\nattribute",
    "msgstr": "\"quoted attribute\""
  };

  const TEST_FILE = [
    "# This is",
    "# multiline comment",
    "#, fuzzy",
    "msgctxt \"simple attribute\"",
    "msgid \"multiline\\n\"",
    "\"attribute\"",
    "msgstr \"\\\"quoted attribute\\\"\""
  ].join("\n");

  it("encodes entries", function() {
    console.log(TEST_FILE);
    expect(encodeEntries([TEST_ENTRY])).toBe(TEST_FILE);
  });

  it("decodes entries", function() {
    expect(decodeEntries(TEST_FILE)[0]).toEqual(TEST_ENTRY);
  });

});
