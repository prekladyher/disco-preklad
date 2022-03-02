import { encodeEntries, decodeEntries } from  "./main.js";

describe("PO file library", function() {

  const TEST_ENTRY = {
    "#": "This is\nmultiline comment",
    "#,": "fuzzy",
    "msgctxt": "simple attribute",
    "msgid": "multiline\nattribute",
    "msgstr": "\"quoted attribute\""
  };

  const TEST_FILE = `
    # This is
    # multiline comment
    #, fuzzy
    msgctxt \"simple attribute\"
    msgid ""
    "multiline\\n"
    "attribute"
    msgstr ""
    "\\"quoted attribute\\""
  `.replace(/^ +/gm, "").trim();

  it("encodes entries", function() {
    expect(encodeEntries([TEST_ENTRY])).toBe(TEST_FILE);
  });

  it("decodes entries", function() {
    expect(decodeEntries(TEST_FILE)[0]).toEqual(TEST_ENTRY);
  });

  it("encodes as Lokalize", function() {
    expect(encodeEntries([{ msgstr: "foo\n" }])).toBe(`msgstr ""\n"foo\\n"`);
    expect(encodeEntries([{ msgstr: "foo\nbar\n" }])).toBe(`msgstr ""\n"foo\\n"\n"bar\\n"`);
  });
});
