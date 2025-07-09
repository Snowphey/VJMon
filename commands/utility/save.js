const { SlashCommandBuilder } = require('discord.js');
const { execSync } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('save')
        .setDescription('Demande une sauvegarde d\'état (save state)'),
    
    async execute(interaction) {
        try {
            // Trouve la fenêtre DeSmuME-CLI
            const windowId = await this.getDesmumeWindowId();
            if (!windowId) {
                await interaction.reply('❌ DeSmuME non détecté');
                return;
            }
            
            // Envoie Shift+F1 (save state slot 1) via xdotool à la fenêtre DeSmuME
            execSync(`DISPLAY=:99 xdotool windowfocus ${windowId}`);
            execSync(`DISPLAY=:99 xdotool key --window ${windowId} shift+F1`);
            
            await interaction.reply('💾 Sauvegarde du jeu dans le slot 1 (Shift+F1)');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            await interaction.reply('❌ Erreur lors de la sauvegarde');
        }
    },

    async getDesmumeWindowId() {
        try {
            // Cherche une fenêtre avec "DeSmuME" dans le titre
            const result = execSync('DISPLAY=:99 xdotool search --name "DeSmuME"', { encoding: 'utf8' });
            const windowIds = result.trim().split('\n').filter(id => id);
            return windowIds[0] || null;
        } catch (error) {
            return null;
        }
    }
};
