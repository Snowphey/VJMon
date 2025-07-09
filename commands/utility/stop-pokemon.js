const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop-pokemon')
        .setDescription('Arrête l\'interface de contrôle Pokemon et nettoie les messages'),
    
    async execute(interaction) {
        if (global.mainMessage) {
            try {
                await global.mainMessage.edit({
                    content: '🛑 Session Pokemon terminée.',
                    files: [],
                    components: []
                });
                
                global.mainMessage = null;
                await interaction.reply({ content: '✅ Session Pokemon arrêtée avec succès!', ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de l\'arrêt:', error);
                global.mainMessage = null;
                await interaction.reply({ content: '⚠️ Session nettoyée (le message principal était peut-être déjà supprimé).', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '❌ Aucune session Pokemon active trouvée.', ephemeral: true });
        }
    }
};
