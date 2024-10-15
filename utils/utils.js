//const { useQueue, QueueRepeatMode } = require("discord-player");
const { QueueRepeatMode } = require('discord-player');
const { createActionRow } = require('./playbackButtons');

function inChannel(channel){
    if (!channel){
        return false;
    } 
    return true;

};

function validQueue(queue){
    if (!queue || !queue.isPlaying()){
        return false;
    }
    return true;
};

const replyOrUpdate = async (interaction, replyMode, reply) => {
    try{
        if(replyMode === 'reply'){
            await interaction.reply({content : `${reply}`, ephemeral: true});
        }else{
            await interaction.update({components : [createActionRow(interaction.guild.id, false)]});
        }
    } catch (error){
        return interaction.reply(`Failed to reply: ${error.message}`);
    }
};

const setRepeatMode = async (interaction, queue, repeatType, replyMode) => {
    try{
        let currentSong = queue.currentTrack;

        if (repeatType === 'song'){ 
            if (queue.repeatMode === QueueRepeatMode.OFF){ //If type is to repeat current song AND its not in repeat mode yet
                queue.setRepeatMode(QueueRepeatMode.TRACK);
                await replyOrUpdate(interaction, replyMode, `Loop ${currentSong.title}`);
                
            }else{ //Turning off repeat mode cuz its already off
                queue.setRepeatMode(QueueRepeatMode.OFF);
                await replyOrUpdate(interaction, replyMode, `Stopped Looping ${currentSong}`)
            }

        } else if (repeatType === 'playlist') { 
            if (queue.repeatMode === QueueRepeatMode.OFF){
                queue.setRepeatMode(QueueRepeatMode.QUEUE);
                await replyOrUpdate(interaction, replyMode, `Looping current Playlist`);
            }else{
                queue.setRepeatMode(QueueRepeatMode.OFF);
                await replyOrUpdate(interaction, replyMode, `Stopped Looping current Playlist`);
            }
        }
    } catch (error) {
        return interaction.reply(`Failed to loop Song: ${error.message}`);
    }
}

const clearPlaylist = async (interaction, queue, replyMode) => {
    try{
        queue.clear();
        await replyOrUpdate(interaction, replyMode, 'Cleared current Playlist')
    } catch (error){
        return interaction.reply(`Failed to clear playlist: ${error.message}`);
    }
}

//Disable the buttons of previous messaged passed in from
const disablePreviousMsgBtn = async (queue) => {
    if (queue.metadata.lastMessage){
        try {
            await queue.metadata.lastMessage.edit({
                components: [createActionRow(queue.guild.id, true)] // Pass true to disable buttons
            });
        } catch (error) {
            console.error('Failed to disable buttons from the previous message:', error);
        }
    }
}

module.exports = {
    inChannel,
    validQueue,
    setRepeatMode,
    clearPlaylist,
    disablePreviousMsgBtn,
};