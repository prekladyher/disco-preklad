
/**
 * Base Unity/MonoScript types.
 */
const BaseScript = {
  $EmptyArray: [
    { name: "size", type: "int", value: 0 },
  ],
  Base: [
    { name: "m_GameObject", type: "PPtr" /* GameObject */ },
    { name: "m_Enabled", type: "uint8", value: 1 },
    { name: "m_Script", type: "PPtr" /* MonoScript */ },
    { name: "m_Name", type: "string" },
  ],
  PPtr: [
    { name: "m_FileID", type: "uint32" },
    { name: "m_PathID", type: "uint64" },
  ],
  Vector2f: [
    { name: "x", type: "float" },
    { name: "y", type: "float" },
  ],
  Rectf: [
    { name: "x", type: "float" },
    { name: "y", type: "float" },
    { name: "width", type: "float" },
    { name: "height", type: "float" },
  ],
  ColorRGBA: [
    { name: "r", type: "float" },
    { name: "g", type: "float" },
    { name: "b", type: "float" },
    { name: "a", type: "float" },
  ],
  UnityEvent: [
    { name: "m_PersistentCalls", type: "PersistentCallGroup" }
  ],
  PersistentCallGroup: [
    { name: "m_Calls", type: "$EmptyArray" }
  ],
};

/**
 * Field type.
 */
const BaseField = {
  Field: [
    { name: "title", type: "string" },
    { name: "value", type: "string" },
    { name: "type", type: "int" },
    { name: "typeString", type: "string" }
  ],
  Fields: {
    struct: [
      { name: "fields", type: "Field[]" }
    ],
    decode: value => {
      const result = {};
      const $schema = Symbol.for("$schema");
      Object.defineProperty(result, $schema, { value: [] });
      for (let field of value.fields) {
        let { title, type, value: fieldValue, typeString} = field;
        result[$schema].push({ title, type, typeString });
        result[title] = fieldValue;
      }
      return result;
    },
    encode: value => {
      const $schema = Symbol.for("$schema");
      const result = [];
      for (let fieldDef of value[$schema] || []) {
        result.push({ value: value[fieldDef.title], ...fieldDef.title });
      }
      return result;
    }
  }
};


/**
 * LanguageSourceAsset types.
 */
const LanguageSourceAsset = {
  LanguageSourceAsset: [
    { name: "m_GameObject", type: "Base" },
    { name: "mSource", type: "LanguageSourceData" },
  ],
  LanguageSourceData: [
    { name: "UserAgreesToHaveItOnTheScene", type: "uint8", value: 0 },
    { name: "UserAgreesToHaveItInsideThePluginsFolder", type: "uint8", value: 0 },
    { name: "GoogleLiveSyncIsUptoDate", type: "uint8", value: 1 },
    { name: "mTerms", type: "TermData[]" },
    { name: "CaseInsensitiveTerms", type: "uint8" },
    { name: "OnMissingTranslation", type: "int", value: 1 },
    { name: "mTerm_AppName", type: "string", value: "" },
    { name: "mLanguages", type: "LanguageData[]" },
    { name: "IgnoreDeviceLanguage", type: "uint8" },
    { name: "_AllowUnloadingLanguages", type: "int", value: 0 },
    { name: "Google_WebServiceURL", type: "string", },
    { name: "Google_SpreadsheetKey", type: "string" },
    { name: "Google_SpreadsheetName", type: "string" },
    { name: "Google_LastUpdatedVersion", type: "string" },
    { name: "GoogleUpdateFrequency", type: "int" },
    { name: "GoogleInEditorCheckFrequency", type: "int" },
    { name: "GoogleUpdateSynchronization", type: "int" },
    { name: "GoogleUpdateDelay", type: "float", value: 0 },
    { name: "Assets" , type: "PPtr[]" },
  ],
  TermData: [
    { name: "Term", type: "string" },
    { name: "TermType", type: "int" },
    { name: "Languages", type: "string[]" },
    { name: "Flags", type: "uint8[]" },
    { name: "Languages_Touch", type: "$EmptyArray" },
  ],
  LanguageData: [
    { name: "Name", type: "string" },
    { name: "Code", type: "string" },
    { name: "Flags", type: "uint8" },
  ],
};

/**
 * DialogueDatabase asset type.
 */
const DialogueDatabase = {
  DialogueDatabase: [
    { name: "m_GameObject", type: "Base" },
    { name: "version", type: "string" },
    { name: "author", type: "string" },
    { name: "description", type: "string" },
    { name: "globalUserScript", type: "string" },
    { name: "emphasisSettings", type: "EmphasisSetting[]" },
    { name: "actors", type: "Actor[]" },
    { name: "items", type: "Item[]" },
    { name: "locations", type: "$EmptyArray" /* Location[] */ },
    { name: "variables", type: "Variable[]" },
    { name: "conversations", type: "Conversation[]" },
    { name: "syncInfo", type: "SyncInfo" },
  ],
  EmphasisSetting: [
    { name: "color", type: "ColorRGBA" },
    { name: "bold", type: "uint8" },
    { name: "italic", type: "uint8" },
    { name: "underline", type: "uint8" },
  ],
  Actor: [
    { name: "id", type: "int" },
    { name: "fields", type: "Fields" },
    { name: "portrait", type: "PPtr" /* $Texture2D */ },
    { name: "spritePortrait", type: "PPtr" /* $Sprite */ },
    { name: "alternatePortraits", type: "PPtr[]" },
    { name: "spritePortraits", type: "PPtr[]" },
  ],
  Item: [
    { name: "id", type: "int" },
    { name: "fields", type: "Fields" },
  ],
  Variable: [
    { name: "id", type: "int" },
    { name: "fields", type: "Fields" },
  ],
  Conversation: [
    { name: "id", type: "int" },
    { name: "fields", type: "Fields" },
    { name: "overrideSettings", type: "ConversationOverrideDisplaySettings" },
    { name: "nodeColor", type: "string" },
    { name: "dialogueEntries", type: "DialogueEntry[]" },
    { name: "canvasScrollPosition", type: "Vector2f" },
    { name: "canvasZoom", type: "float", value: 1 },
  ],
  ConversationOverrideDisplaySettings: [
    { name: "useOverrides", type: "uint8" },
    { name: "overrideSubtitleSettings", type: "uint8" },
    { name: "showNPCSubtitlesDuringLine", type: "uint8" },
    { name: "showNPCSubtitlesWithResponses", type: "uint8" },
    { name: "showPCSubtitlesDuringLine", type: "uint8" },
    { name: "skipPCSubtitleAfterResponseMenu", type: "uint8" },
    { name: "subtitleCharsPerSecond", type: "float" },
    { name: "minSubtitleSeconds", type: "float" },
    { name: "continueButton", type: "int" },
    { name: "overrideSequenceSettings", type: "uint8" },
    { name: "defaultSequence", type: "string" },
    { name: "defaultPlayerSequence", type: "string" },
    { name: "defaultResponseMenuSequence", type: "string" },
    { name: "overrideInputSettings", type: "uint8" },
    { name: "alwaysForceResponseMenu", type: "uint8" },
    { name: "includeInvalidEntries", type: "uint8" },
    { name: "responseTimeout", type: "float" },
  ],
  DialogueEntry: [
    { name: "id", type: "int" },
    { name: "fields", type: "Fields" },
    { name: "conversationID", type: "int" },
    { name: "isRoot", type: "uint8" },
    { name: "isGroup", type: "uint8" },
    { name: "nodeColor", type: "string" },
    { name: "delaySimStatus", type: "uint8" },
    { name: "falseConditionAction", type: "string" },
    { name: "conditionPriority", type: "int" },
    { name: "outgoingLinks", type: "Link[]" },
    { name: "conditionsString", type: "string" },
    { name: "userScript", type: "string" },
    { name: "onExecute", type: "UnityEvent" },
    { name: "canvasRect", type: "Rectf" },
  ],
  Link: [
    { name: "originConversationID", type: "int" },
    { name: "originDialogueID", type: "int" },
    { name: "destinationConversationID", type: "int" },
    { name: "destinationDialogueID", type: "int" },
    { name: "isConnector", type: "uint8" },
    { name: "priority", type: "int" },
  ],
  SyncInfo: [
    { name: "syncActors", type: "uint8" },
    { name: "syncItems", type: "uint8" },
    { name: "syncLocations", type: "uint8" },
    { name: "syncVariables", type: "uint8" },
    { name: "syncActorsDatabase", type: "PPtr" /* $DialogueDatabase */ },
    { name: "syncItemsDatabase", type: "PPtr" /* $DialogueDatabase */ },
    { name: "syncLocationsDatabase", type: "PPtr" /* $DialogueDatabase */ },
    { name: "syncVariablesDatabase", type: "PPtr" /* $DialogueDatabase */ },
  ],
};

export default {
  ...BaseScript,
  ...BaseField,
  ...LanguageSourceAsset,
  ...DialogueDatabase
};
