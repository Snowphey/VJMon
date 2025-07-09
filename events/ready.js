const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Connecté en tant que ${client.user.tag}`);
        
        // Fonction récursive pour charger les commandes depuis tous les sous-dossiers
        function loadCommands(dir) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    // Si c'est un dossier, explorer récursivement
                    loadCommands(itemPath);
                } else if (item.endsWith('.js')) {
                    // Si c'est un fichier .js, charger la commande
                    const command = require(itemPath);
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        console.log(`📝 Commande chargée: ${command.data.name} depuis ${itemPath}`);
                    } else {
                        console.log(`⚠️ Commande ignorée: ${itemPath} - structure invalide`);
                    }
                }
            }
        }
        
        // Charger les commandes depuis le dossier commands
        const commandsPath = path.join(__dirname, '..', 'commands');
        try {
            const commandsStats = fs.statSync(commandsPath);
            if (commandsStats.isDirectory()) {
                loadCommands(commandsPath);
                console.log('✅ Commandes chargées avec succès');
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des commandes:', error);
        }
        
        console.log('ℹ️ Pour déployer les commandes, utilisez: npm run deploy');
    },
};
