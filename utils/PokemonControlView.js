const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, MessageFlags } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

let captureCounter = 0;

class PokemonControlView {
    constructor(interaction = null) {
        this.interaction = interaction;
    }

    async sendSingleCommand(key) {
        try {
            // Trouve la fenêtre DeSmuME-CLI
            const windowId = await this.getDesmumeWindowId();
            if (!windowId) {
                throw new Error('Fenêtre DeSmuME non trouvée');
            }
            
            // Envoie la touche via xdotool
            const keyMap = this.getKeyMapping(key);
            if (keyMap) {
                execSync(`DISPLAY=:99 xdotool windowfocus ${windowId}`);
                execSync(`DISPLAY=:99 xdotool key --window ${windowId} ${keyMap}`);
                await this.sleep(100); // Petit délai pour éviter les inputs trop rapides
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la commande:', error.message);
        }
    }

    async handleCommand(interaction, key, repeat = 1) {
        // Indiquer à Discord que l'interaction est en cours de traitement
        await interaction.deferUpdate();
        
        // Trouve la fenêtre DeSmuME-CLI
        const windowId = await this.getDesmumeWindowId();
        if (!windowId) {
            console.error('Fenêtre DeSmuME non trouvée');
            return;
        }
        
        const keyMap = this.getKeyMapping(key);
        if (!keyMap) {
            console.error('Touche non reconnue:', key);
            return;
        }
        
        for (let i = 0; i < repeat; i++) {
            try {
                execSync(`DISPLAY=:99 xdotool windowfocus ${windowId}`);
                execSync(`DISPLAY=:99 xdotool key --window ${windowId} ${keyMap}`);
                await this.sleep(500); // Délai entre les répétitions
            } catch (error) {
                console.error('Erreur lors de l\'envoi de la commande:', error.message);
            }
        }

        const screenshotPath = await this.captureDesmume();
        if (screenshotPath) {
            // Récupérer le message principal partagé
            const mainMessage = global.mainMessage;
            
            if (mainMessage) {
                try {
                    const attachment = new AttachmentBuilder(screenshotPath);
                    const components = this.createComponents();
                    
                    await mainMessage.edit({
                        content: 'Capture du jeu :',
                        files: [attachment],
                        components: components
                    });
                } catch (error) {
                    console.error('Erreur lors de la mise à jour du message principal:', error);
                }
            } else {
                console.error('Message principal non trouvé - aucune session active');
            }
        } else {
            console.error('Impossible de capturer DeSmuME');
        }
    }

    createComponents() {
        // Ligne 0
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_a')
                    .setLabel('A')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('btn_up')
                    .setLabel('⬆️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('btn_b')
                    .setLabel('B')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('btn_x')
                    .setLabel('X')
                    .setStyle(ButtonStyle.Success)
            );

        // Ligne 1
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_left')
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('btn_down')
                    .setLabel('⬇️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('btn_right')
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('btn_y')
                    .setLabel('Y')
                    .setStyle(ButtonStyle.Success)
            );

        // Ligne 2 (x2/x3)
        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_a_x2')
                    .setLabel('A x2')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('btn_up_x3')
                    .setLabel('⬆️ x3')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('btn_b_x2')
                    .setLabel('B x2')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('btn_capture')
                    .setLabel('🔄')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Ligne 3 (x3)
        const row4 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_left_x3')
                    .setLabel('⬅️ x3')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('btn_down_x3')
                    .setLabel('⬇️ x3')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('btn_right_x3')
                    .setLabel('➡️ x3')
                    .setStyle(ButtonStyle.Primary)
            );

        return [row1, row2, row3, row4];
    }

    // Méthode pour obtenir l'ID de la fenêtre DeSmuME
    async getDesmumeWindowId() {
        try {
            const result = execSync('DISPLAY=:99 xdotool search --name "desmume" 2>/dev/null | head -1', { encoding: 'utf-8' });
            const windowId = result.trim();
            return windowId || null;
        } catch (error) {
            console.error('Erreur lors de la recherche de fenêtre DeSmuME:', error.message);
            return null;
        }
    }

    // Mapping des touches du bot vers les touches DeSmuME
    getKeyMapping(key) {
        const keyMap = {
            // Touches directionnelles
            'up': 'Up',
            'down': 'Down', 
            'left': 'Left',
            'right': 'Right',
            
            // Boutons principaux (mapping standard DeSmuME)
            'a': 'x',        // A = X
            'b': 'z',        // B = Z  
            'x': 's',        // X = S
            'y': 'a',        // Y = A
            
            // Boutons système
            'start': 'Return',   // START = Entrée
            'select': 'Tab',     // SELECT = Tab
            
            // Touches spéciales
            'capture': null      // Pas de mapping pour capture
        };
        
        return keyMap[key.toLowerCase()] || null;
    }

    async captureDesmume(outputFile = 'screenshot.png') {
        try {
            await this.sleep(400);
            
            // Pour desmume-cli avec xvfb, on utilise xdotool et import/scrot
            const windowId = await this.getDesmumeWindowId();
            if (!windowId) {
                console.error('Fenêtre DeSmuME non trouvée pour la capture');
                return null;
            }

            // Capture la fenêtre avec import (ImageMagick) sur le display virtuel
            try {
                execSync(`DISPLAY=:99 import -window ${windowId} ${outputFile}`);
            } catch (error) {
                // Si import n'est pas disponible, essayer avec scrot
                try {
                    const geometry = execSync(`DISPLAY=:99 xdotool getwindowgeometry ${windowId}`, { encoding: 'utf-8' });
                    const lines = geometry.split('\n');
                    const positionLine = lines.find(line => line.includes('Absolute upper-left X:'));
                    const sizeLine = lines.find(line => line.includes('Geometry:'));
                    
                    if (positionLine && sizeLine) {
                        const x = positionLine.split(':')[1].trim();
                        const y = lines.find(line => line.includes('Absolute upper-left Y:')).split(':')[1].trim();
                        const size = sizeLine.split(':')[1].trim();
                        
                        execSync(`DISPLAY=:99 scrot -a ${x},${y},${size} ${outputFile}`);
                    } else {
                        // Fallback: capture tout l'écran virtuel
                        execSync(`DISPLAY=:99 scrot ${outputFile}`);
                    }
                } catch (scrotError) {
                    console.error('Erreur avec scrot aussi:', scrotError.message);
                    return null;
                }
            }

            return outputFile;
        } catch (error) {
            console.error('Erreur lors de la capture:', error.message);
            return null;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = PokemonControlView;
