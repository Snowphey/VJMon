const { Events, AttachmentBuilder } = require('discord.js');
const PokemonControlView = require('../utils/PokemonControlView');

// Variable pour éviter les récréations trop fréquentes
let recreationTimeout = null;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Vérifier que le message a un canal (éviter les DMs et autres contextes spéciaux)
        if (!message.channel || !message.channel.id) return;

        // Vérifier s'il y a un message principal actif
        const mainMessage = global.mainMessage;
        if (!mainMessage) return;

        // Ignorer si le message reçu est le message principal lui-même (éviter la boucle infinie)
        if (message.id === mainMessage.id) return;

        // Ignorer les messages envoyés par le bot qui ont le même contenu que le mainMessage (éviter la boucle)
        if (
            message.author.id === message.client.user.id &&
            message.content === 'Capture du jeu :'
        ) return;

        // Vérifier que le message principal a un canal valide
        if (!mainMessage.channelId) return;

        // Vérifier si le message est dans le même canal que le message principal
        if (message.channel.id !== mainMessage.channelId) return;
        
        // Annuler le timeout précédent s'il existe
        if (recreationTimeout) {
            clearTimeout(recreationTimeout);
        }
        
        // Programmer la recréation avec un délai pour éviter le spam
        recreationTimeout = setTimeout(async () => {
            try {
                // Vérifier si le message principal est toujours le dernier message
                const lastMessages = await message.channel.messages.fetch({ limit: 1 });
                const lastMessage = lastMessages.first();
                
                // Si le message principal est déjà le dernier, pas besoin de le recréer
                if (lastMessage && lastMessage.id === mainMessage.id) {
                    return;
                }
                
                // Vérifier si le message principal existe encore avant de le supprimer
                try {
                    await mainMessage.fetch();
                    // Supprimer l'ancien message principal
                    await mainMessage.delete();
                } catch (fetchError) {
                    // Le message n'existe plus, on continue sans le supprimer
                    console.log('Le message principal a déjà été supprimé');
                    return; // On arrête la recréation si le message principal n'existe plus
                }

                // Recréer le message principal en bas du canal
                const view = new PokemonControlView();
                const screenshotPath = await view.captureDesmume();
                
                if (screenshotPath) {
                    const attachment = new AttachmentBuilder(screenshotPath);
                    const components = view.createComponents();
                    
                    const newMainMessage = await message.channel.send({
                        content: 'Capture du jeu :',
                        files: [attachment],
                        components: components
                    });
                    
                    // Mettre à jour la référence globale
                    global.mainMessage = newMainMessage;
                } else {
                    console.error('Impossible de capturer DeSmuME lors de la recréation du message');
                }
            } catch (error) {
                console.error('Erreur lors de la recréation du message principal:', error);
            }
        }, 2000); // Délai de 2 secondes pour éviter le spam
    }
};
