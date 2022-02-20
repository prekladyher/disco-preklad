# Překlad Disco Elysium

Toto je projekt pro český fanouškovský překlad hry Disco Elysium.

## Rozdělení složek

* `scripts/` - NodeJS skripty pro práci s projektem
* `source/game/` - zdrojové binární assety hry (není součástí repa)
* `source/l10n/` - překladové soubory strukturované dle jazyka

## Skripty v projektu

Skripty v projektu jsou NodeJS skripty (před spuštěním skriptu je nutná instalace závislostí pomocí příkazu `npm install`).

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

```
node scripts/game.js read -jp '$.actors' DialogueDatabase source/game/en/DialogueDatabase*.dat > actors.json
node scripts/game.js read -jp '$.items' DialogueDatabase source/game/en/DialogueDatabase*.dat > items.json
node scripts/game.js read -jp '$.conversations[665]' DialogueDatabase source/game/en/DialogueDatabase*.dat > conversation.json
```

Zobrazení datové struktury lokalizačních dat:

```
node scripts/game.js read -j LanguageSourceAsset source/game/en/GeneralLockit*.dat > general-en.json
```
