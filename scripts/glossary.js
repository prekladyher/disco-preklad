import { GoogleSpreadsheet } from "google-spreadsheet";
import xmljs from "xml-js";
import fs from "fs/promises";

const doc = new GoogleSpreadsheet("1GMYp3UxK3nb5LX6QzQO8vLpDeY5ikrSnFZxIkJzE_KA");

const GS_CLIENT_EMAIL = process.env.GS_CLIENT_EMAIL;
const GS_PRIVATE_KEY = process.env.GS_PRIVATE_KEY?.replace(/\\n/g, "\n");

const OUTPUT_PATH = "terms.tbx"

async function loadGlossary(document) {
  await document.useServiceAccountAuth({
    client_email: GS_CLIENT_EMAIL,
    private_key: GS_PRIVATE_KEY
  });
  await document.loadInfo();
  const sheet = document.sheetsByIndex[0];
  const rows = await sheet.getRows();
  return rows.map(row => {
    return {
      source: row["Výraz"],
      target: row["Překlad"],
      note: row["Poznámka"],
      caps: row["aA"],
      appr: row["OK"],
      formal: row["TV"]
    }
  }).filter(term => !!term.target);
}

function element(name, attrs, children) {
  return {
    type: "element",
    name: name,
    attributes: attrs,
    elements: children
  }
}

function text(value) {
  return {
    type: "text",
    text: value
  };
}

function createTags(term) {
  const tags = [];
  if (term.appr) {
    tags.push("[OK]");
  }
  if (term.caps) {
    tags.push("[aA]");
  }
  if (term.formal) {
    tags.push(term.formal.toLowerCase() === "v" ? "[VYKAT]" : "[TYKAT]");
  }
  return tags;
}

function createTermEntry(term) {
  return element("termEntry", { id: term.source }, [
    element("descrip", { type: "definition" }, [
      text([...createTags(term), term.note].join(" "))
    ]),
    element("langSet", { "xml:lang": "en" }, [
      element("tig", null, [
        element("term", null, [text(term.source)])
      ])
    ]),
    element("langSet", { "xml:lang": "cs" }, [
      element("tig", null, [
        element("term", null, [text(term.target)])
      ])
    ])
  ]);
}

function createTbx(terms) {
  terms.sort((a, b) => a.source.localeCompare(b.source, "en", { sensitivity: "base" }));
  return {
    declaration: {
      attributes: {
        version: "1.0",
        encoding: "UTF-8"
      }
    },
    elements: [
      {
        type: "doctype",
        doctype: "martif PUBLIC 'ISO 12200:1999A//DTD MARTIF core (DXFcdV04)//EN' 'TBXcdv04.dtd'"
      },
      element("martif", { type: "TBX", "xml:lang": "en_US" }, [
        element("text", null, [
          element("body", null, terms.map(createTermEntry))
        ])
      ])
    ]
  };
}

const terms = await loadGlossary(doc);
const tbx = xmljs.json2xml(createTbx(terms), { spaces: 2 });
await fs.writeFile(OUTPUT_PATH, tbx);
