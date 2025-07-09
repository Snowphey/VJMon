#!/bin/bash

# Installation ultra-simple pour VPS Ubuntu
echo "🚀 Installation Bot Pokémon Discord"
echo "==================================="

# Installer tout d'un coup
echo "📦 Installation des dépendances..."
sudo apt update -qq && sudo apt install -y xvfb desmume xdotool imagemagick

# Vérifier que ça marche
if ! command -v node &> /dev/null || ! command -v desmume-cli &> /dev/null; then
    echo "❌ Erreur d'installation"
    exit 1
fi

npm install

# Config
if [ ! -f "config.json" ]; then
    cp config.json.example config.json
    echo "📝 Configure maintenant : nano config.json"
fi

# Script de démarrage simple
cat > start-bot.sh << 'EOF'
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

# Démarrer DeSmuME
if ! pgrep -f "desmume.*\.nds" > /dev/null; then
    DISPLAY=:99 desmume pokemon.nds &
    sleep 5
fi

# Lancer bot
npm run deploy && DISPLAY=:99 npm start
EOF

chmod +x start-bot.sh

echo "✅ Installation terminée !"
echo ""
echo "Prochaines étapes :"
echo "1. cp ta-rom.nds ./pokemon.nds"
echo "2. nano config.json"
echo "3. ./start-bot.sh"
