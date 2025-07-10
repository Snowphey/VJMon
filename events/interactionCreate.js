const { Events, MessageFlags, AttachmentBuilder } = require('discord.js');
const PokemonControlView = require('../utils/PokemonControlView');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Gestion des slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            
            if (!command) {
                console.error(`❌ Commande inconnue: ${interaction.commandName}`);
                await interaction.reply({ 
                    content: '❌ Commande non trouvée. Assurez-vous que les commandes ont été déployées avec `npm run deploy`.', 
                    flags: MessageFlags.Ephemeral 
                });
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error('Erreur lors de l\'exécution de la commande:', error);
                
                const errorMessage = '❌ Une erreur est survenue lors de l\'exécution de cette commande.';
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
                }
            }
            return;
        }

        // Gestion des boutons (code existant)
        if (!interaction.isButton()) return;

        const view = new PokemonControlView(interaction);
        
        switch (interaction.customId) {
            case 'btn_a':
                await view.handleCommand(interaction, 'a');
                break;
            case 'btn_b':
                await view.handleCommand(interaction, 'b');
                break;
            case 'btn_x':
                await view.handleCommand(interaction, 'x');
                break;
            case 'btn_y':
                await view.handleCommand(interaction, 'y');
                break;
            case 'btn_up':
                await view.handleCommand(interaction, 'up');
                break;
            case 'btn_down':
                await view.handleCommand(interaction, 'down');
                break;
            case 'btn_left':
                await view.handleCommand(interaction, 'left');
                break;
            case 'btn_right':
                await view.handleCommand(interaction, 'right');
                break;
            case 'btn_a_x2':
                await view.handleCommand(interaction, 'a', 2);
                break;
            case 'btn_b_x2':
                await view.handleCommand(interaction, 'b', 2);
                break;
            case 'btn_up_x3':
                await view.handleCommand(interaction, 'up', 3);
                break;
            case 'btn_left_x3':
                await view.handleCommand(interaction, 'left', 3);
                break;
            case 'btn_down_x3':
                await view.handleCommand(interaction, 'down', 3);
                break;
            case 'btn_right_x3':
                await view.handleCommand(interaction, 'right', 3);
                break;
            case 'btn_capture':
                // Indiquer à Discord que l'interaction est en cours de traitement
                await interaction.deferUpdate();
                
                const capturePath = await view.captureDesmume();
                
                if (capturePath) {
                    // Récupérer le message principal partagé
                    let mainMessage = global.mainMessage;
                    
                    if (mainMessage) {
                        try {
                            // Vérifier que le message existe encore
                            try {
                                await mainMessage.fetch();
                            } catch (fetchError) {
                                // Le message n'existe plus : ne rien faire, l'affichage va se rafraîchir automatiquement
                                return;
                            }
                            const attachment = new AttachmentBuilder(capturePath);
                            const components = view.createComponents();
                            
                            await mainMessage.edit({
                                content: 'Capture du jeu :',
                                files: [attachment],
                                components: components
                            });
                        } catch (error) {
                            console.error('Erreur lors de la mise à jour du message principal:', error);
                            await interaction.followUp({ content: '❌ Erreur lors de la mise à jour de l\'affichage.', flags: MessageFlags.Ephemeral });
                        }
                    } else {
                        await interaction.followUp({ content: '❌ Message principal non trouvé. Utilisez /start-pokemon d\'abord.', flags: MessageFlags.Ephemeral });
                    }
                } else {
                    await interaction.followUp({ content: '❌ Capture échouée : DeSmuME non détecté.', flags: MessageFlags.Ephemeral });
                }
                break;
        }
    },
};
