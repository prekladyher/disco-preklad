#!/bin/bash

mkdir -p target/text

node scripts/l10n append -c source/l10n/cs/Dialogues/ > target/text/Dialogues.po
node scripts/l10n append -c source/l10n/cs/General.po > target/text/General.po
