const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');

function checkRepeatMode(mode, matchMode){
    if (mode === matchMode){
        return true;
    }
    return false;
}

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

function createLoopSongButtons(guildID){
    const queue = useQueue(guildID);
    const repeatOn = checkRepeatMode(queue.repeatMode, QueueRepeatMode.TRACK);

    return new ButtonBuilder()
        .setCustomId('loopSong')
        .setLabel(repeatOn ? 'Stop Looping Song' : 'Loop Song')
        .setStyle(ButtonStyle.Primary);
}

function createLoopPlayListButtons(guildID){
    const queue = useQueue(guildID);
    const repeatOn = checkRepeatMode(queue.repeatMode, QueueRepeatMode.QUEUE);

    return new ButtonBuilder()
        .setCustomId('loopPlaylist')
        .setLabel(repeatOn ? 'Stop Looping Playlist' : 'Loop Playlist')
        .setStyle(ButtonStyle.Primary);
}

function createActionRow(guildID){
    return new ActionRowBuilder()
        .addComponents(createPlayPauseButton(guildID), createLoopSongButtons(guildID), createLoopPlayListButtons(guildID), next);
}


module.exports = {
    createActionRow,
};