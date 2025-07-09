const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const PokemonControlView = require('../../utils/PokemonControlView');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('capture')
        .setDescription('Prend une capture d\'écran de DeSmuME'),
    
    async execute(interaction) {
        const view = new PokemonControlView(interaction);
        const screenshotPath = await view.captureDesmume();
        
        if (screenshotPath) {
            const attachment = new AttachmentBuilder(screenshotPath);
            await interaction.reply({ files: [attachment] });
        } else {
            await interaction.reply('❌ Fenêtre DeSmuME non trouvée.');
        }
    }
};
