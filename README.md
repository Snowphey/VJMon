# Pokémon Discord Bot

Bot Discord pour contrôler un émulateur Pokémon sur DeSmuME via des boutons Discord.

## Installation rapide sur VPS Ubuntu

### Option 1: Script automatique
```bash
chmod +x quick-install.sh
./quick-install.sh
```

### Option 2: Installation manuelle
```bash
# 1. Installer les dépendances
sudo apt update && sudo apt install -y nodejs npm xvfb desmume xdotool imagemagick git

# 2. Cloner le projet
git clone https://github.com/Snowphey/VJMon.git
cd VJMon

# 3. Installer les modules Node.js
npm install

# 4. Configurer Discord
nano config.json  # Ajouter ton token Discord, le clientId du bot et le guildId du serveur

# 5. Ajouter ta ROM Pokémon à la racine
cp /chemin/vers/ta/rom.nds ./pokemon.nds

# 6. Lancer le bot
./start-bot.sh
```

## Configuration Discord

Dans `config.json` :
```json
{
  "token": "TOKEN_DE_TON_BOT",
  "clientId": "ID_DE_TON_BOT",
  "guildId": "ID_DU_SERVEUR"
}
```

- **token** : Token sur https://discord.com/developers/applications
- **clientId** : Application ID du bot (même endroit, section Bot)
- **guildId** : ID du serveur Discord où tourne le bot (récupérable avec les options développeur de Discord)

## Commandes Discord

- `/start-pokemon` - Interface de contrôle avec capture d'écran
- `/stop-pokemon` - Met fin à la session en cours
- `/capture` - Capture d'écran simple
- `/save` - Sauvegarde d'état
