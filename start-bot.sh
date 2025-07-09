#!/bin/bash
export DISPLAY=:99

# Démarrer écran virtuel
if ! pgrep -f "Xvfb :99" > /dev/null; then
    Xvfb :99 -screen 0 1024x768x24 &
    sleep 2
fi

# Vérifier ROM
if [ ! -f "pokemon.nds" ]; then
    echo "❌ ROM manquante : copie ta ROM et renomme-la 'pokemon.nds'"
    exit 1
fi

# Démarrer DeSmuME-CLI
if ! pgrep -f "desmume-cli.*\.nds" > /dev/null; then
    DISPLAY=:99 desmume-cli --disable-sound pokemon.nds &
    sleep 5
fi

# Lancer bot
npm run deploy && DISPLAY=:99 npm start
