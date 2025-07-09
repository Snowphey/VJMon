const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const PokemonControlView = require('../../utils/PokemonControlView');

// Variable pour stocker le message principal partagé
let mainMessage = null;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-pokemon')
        .setDescription('Démarre l\'interface de contrôle Pokemon avec capture d\'écran'),
    
    async execute(interaction) {
        const view = new PokemonControlView(interaction);
        const screenshotPath = await view.captureDesmume();
        
        if (!screenshotPath) {
            await interaction.reply('❌ Impossible de capturer DeSmuME.');
            return;
        }

        const attachment = new AttachmentBuilder(screenshotPath);
        const components = view.createComponents();
        
        const response = await interaction.reply({
            content: 'Capture du jeu :',
            files: [attachment],
            components: components,
            withResponse: true
        });

        // Permettre l'accès global au message principal
        global.mainMessage = response.resource.message;
    }
};
