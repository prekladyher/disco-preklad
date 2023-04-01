# Překlad Disco Elysium

Toto je projekt pro český fanouškovský překlad hry Disco Elysium.

## Rozdělení složek

* `scripts/` - NodeJS skripty pro práci s projektem
* `source/game/` - zdrojové binární assety hry (není součástí repa)
* `source/l10n/` - překladové soubory strukturované dle jazyka

## Skripty v projektu

Skripty v projektu jsou [NodeJS](https://nodejs.org/en/download/) skripty (před spuštěním skriptu je nutná
instalace závislostí pomocí příkazu `npm install`).

* `game.js` - práce s herními soubory
* `glossary.js` - práce s glosářem
* `l10n.js` - práce s překladovými soubory

### Práce s herními soubory

Skript `game.js` umožnuje pracovat s _asset_ soubory.

Herní soubory je nutné ručně extrahovat pomocí nástroje [UBAEA](https://github.com/nesrak1/UABEA) do
složky `source/game/`. Očekávaná struktura souborů je:

```
source/game/en/
  {DISCO_DATA}/StreamingAssets/aa/StandaloneWindows64/dialoguebundle_assets_all* → DialogueDatabase.dat
  {DISCO_DATA}/resources.assets → FontsLockitEnglish.dat
  {DISCO_DATA}/resources.assets → GeneralLockitEnglish.dat
  {DISCO_DATA}/resources.assets → ImagesLockitEnglish.dat
source/game/{lang}
  {DISCO_DATA}/StreamingAssets/AssetBundles/Windows/lockits/{language} → DialogueLockit{Language}.dat
  {DISCO_DATA}/StreamingAssets/AssetBundles/Windows/lockits/{language} → FontsLockit{Language}.dat
  {DISCO_DATA}/StreamingAssets/AssetBundles/Windows/lockits/{language} → GeneralLockit{Language}.dat
  {DISCO_DATA}/StreamingAssets/AssetBundles/Windows/lockits/{language} → ImagesLockit{Language}.dat
```

Pomocí `game.js` je možné exportovat databázi postav, předmětů a data pro konkrétní konverzaci:

```shell
node scripts/game.js read -jp '$.actors' DialogueDatabase source/game/en/DialogueDatabase*.dat > actors.json
node scripts/game.js read -jp '$.items' DialogueDatabase source/game/en/DialogueDatabase*.dat > items.json
node scripts/game.js read -jp '$.conversations[665]' DialogueDatabase source/game/en/DialogueDatabase*.dat > conversation.json
```

Zobrazení datové struktury lokalizačních dat:

```shell
node scripts/game.js read -j LanguageSourceAsset source/game/en/GeneralLockit*.dat > general-en.json
```

### Práce s překladovými soubory

Spojení více souborů v jeden soubor pro překlad (předpokládá existenci složky `target/`):

```shell
node scripts/l10n.js append -g "source/l10n/cs/Dialogues/WHIRLING F1/*.po" > "target/WHIRLING F1.po"
```

Sloučení překladů jednoho souboru do projektových souborů:

```shell
node scripts/l10n.js merge -g "target/WHIRLING F1.po" "source/l10n/cs/Dialogues/WHIRLING F1/*.po"
```


### Sestavení finálního překladu

Pro sestavení finálního překladu je nutné vytvořit `shadow` složku se zdrojovými assety hry.
Obsah složky by měl být následující:

* `lockits/` - složka původními s lockit assety (UABEA export z `disco_Data/resources.assets` nebo `disco_Data/StreamingAssets/AssetBundles/Windows/images/{jazyk}`)
* `images/` - složka s původními PNG texturami (UABEA export z `disco_Data/StreamingAssets/AssetBundles/Windows/images/{jazyk}`)

Pro sestavení překladu stačí zavolat následující příkaz:

```bash
CLEAN= LOCKIT= DIALOGUE= IMAGES= ./build.sh
```
