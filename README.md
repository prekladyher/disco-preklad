# Překlad Disco Elysium

Toto je projekt pro český fanouškovský překlad hry Disco Elysium.

## Rozdělení složek

* `scripts/` - NodeJS skripty pro práci s projektem
* `shadow/` - zdrojové binární assety hry pro sestavování překladu
* `source/` - zdrojové soubory pro překlad
  * `asset/` - ručně upravené assety v UABEA JSON formátu
  * `data/` - doplňující soubory pro překlad
  * `deepl/` - strojově přeložená varianta
  * `game/` - herní soubory případnou analýzu a zpracování
  * `image/` - lokalizované obrázky
  * `l10n/` - překladové soubory

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
node scripts/game.js read -jp '$.actors' DialogueDatabase source/game/en/Disco*.dat > actors.json
node scripts/game.js read -jp '$.items' DialogueDatabase source/game/en/Disco*.dat > items.json
node scripts/game.js read -jp '$.conversations[665]' DialogueDatabase source/game/en/Disco*.dat > conversation.json
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

* `assets/` - složka s DialogueDatabase assetem (`Disco Elysium`)
  * UABEA export z `disco_Data/StreamingAssets/aa/StandaloneWindows64/dialoguebundle_assets_all_3472cb598f88f38eef12cdb3aa5fdc80`
  * UABEA export (JSON) z `disco_Data/sharedassets0.assets` (`0 - SMALL`, `1 - MEDIUM`, `2 - LARGE`)
* `bundles/` - složka s původními asset bundles dle seznamu níže
* `images/` - složka s původními PNG texturami
  * UABEA export textur (PNG) z `disco_Data/StreamingAssets/AssetBundles/Windows/images/english`
  * UABEA export textur (PNG) z `disco_Data/resources.assets` (`button-cont-psy`)
  * UABEA export textur (PNG) z `disco_Data/sharedassets7.assets` (`viscal-fencecrash`, `viscal-footprints-label_8PAIRS`, `viscal-footprints-label-FOOTPRINTS`, `viscal-nest`, `viscal-samaran`)
* `lockits/` - složka původními lockit assety
  * UABEA export z `disco_Data/resources.assets` (`GeneralLockitEnglish`)
  * UABEA export z `disco_Data/StreamingAssets/AssetBundles/Windows/collage/shared` (`CollageModeLockit`)

Pro sestavení překladu stačí zavolat následující příkaz:

```bash
CLEAN= LOCKIT= DIALOGUE= IMAGES= OTHERS= BUNDLES= ./build.sh
```

Následně je nutné aktualizovat v `target/package` následující bundles pomocí UABEA:

* `resources.assets`
   * assety z `target/assets`
   * obrázky z `target/images`
* `sharedassets0.assets` (nutné dělat nad asset bundlem ve složce hry; pro OSX lze nahrát bundle do Windows verze hry)
   * JSON soubory z `source/asset`
* `sharedassets7.assets`
   * obrázky z `target/images`
* `StreamingAssets/AssetBundles/Windows/collage/shared`
   * `CollageModeLockit` z `target/assets`
* `StreamingAssets/AssetBundles/Windows/fonts/english`
   * assety z `source/asset`
   * obrázky z `source/asset`
* `StreamingAssets/AssetBundles/Windows/images/english`
   * obrázky z `target/images`
* `StreamingAssets/aa/StandaloneWindows64/dialoguebundle_assets_all_3472cb598f88f38eef12cdb3aa5fdc80`
   * `DialogueDatabase` asset z `target/assets`

Obsah složky `target/package` je možné následně zabalit do ZIP souboru nebo s použít jako součást instalátoru.
