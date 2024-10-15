const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');

function checkRepeatMode(mode, matchMode){
    if (mode === matchMode){
        return true;
    }
    return false;
}

function createButton(id, label, style, disable){
    const button = new ButtonBuilder()
    .setCustomId(`${id}`)
    .setLabel(`${label}`)
    .setStyle(style);

    button.setDisabled(disable);
    return button;
}


function createPlayPauseButton(guildID, disable){
    const queue = useQueue(guildID);

    // If the queue is null or invalid, default to the non-loop state, basically a fall back state for when the bot exiting voice channel
    const isPaused = queue ? queue.node.isPaused() : false;

    const button = new ButtonBuilder()
        .setCustomId('playpause')
        .setLabel(isPaused ? 'Play' : 'Pause')
        .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Danger);

    button.setDisabled(disable);
    return button;
}

function createLoopSongButtons(guildID, disable){
    const queue = useQueue(guildID);
    // If the queue is null or invalid, default to the non-loop state, basically a fall back state for when the bot exiting voice channel
    const repeatOn = queue ? checkRepeatMode(queue.repeatMode, QueueRepeatMode.TRACK) : false;


    const button = new ButtonBuilder()
        .setCustomId('loopSong')
        .setLabel(repeatOn ? 'Stop Looping Song' : 'Loop Song')
        .setStyle(ButtonStyle.Primary);

    button.setDisabled(disable);
    return button;
}

function createLoopPlayListButtons(guildID, disable){
    const queue = useQueue(guildID);
    // If the queue is null or invalid, default to the non-loop state, basically a fall back state for when the bot exiting voice channel
    const repeatOn = queue ? checkRepeatMode(queue.repeatMode, QueueRepeatMode.QUEUE) : false;


    const button = new ButtonBuilder()
        .setCustomId('loopPlaylist')
        .setLabel(repeatOn ? 'Stop Looping Playlist' : 'Loop Playlist')
        .setStyle(ButtonStyle.Primary);

    button.setDisabled(disable);    
    return button;
}

function createActionRow(guildID, disable){
    return new ActionRowBuilder()
        .addComponents(
            createPlayPauseButton(guildID, disable), 
            createLoopSongButtons(guildID, disable), 
            createLoopPlayListButtons(guildID, disable), 
            createButton('skip', 'Skip', ButtonStyle.Primary, disable),
            createButton('clear', 'Clear', ButtonStyle.Primary, disable)
        );
}


module.exports = {
    createActionRow,
};