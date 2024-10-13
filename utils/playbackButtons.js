const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { useQueue } = require('discord-player');

const next = new ButtonBuilder()
    .setCustomId('skip')
    .setLabel("Skip")
    .setStyle(ButtonStyle.Primary);

function createPlayPauseButton(guildID){
    const queue = useQueue(guildID);
    const isPaused = queue && queue.node.isPaused();

    return new ButtonBuilder()
        .setCustomId('playpause')
        .setLabel(isPaused ? 'Play' : 'Pause')
        .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Danger);
}

function createActionRow(guildID){
    return new ActionRowBuilder()
        .addComponents(createPlayPauseButton(guildID), next);
}




module.exports = {
    createActionRow,
};