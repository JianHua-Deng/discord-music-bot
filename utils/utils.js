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
    if(replyMode === 'reply'){
        await interaction.reply(`${reply}`);
    }else{
        await interaction.update({components : [createActionRow(interaction.guild.id)]});
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

module.exports = {
    inChannel,
    validQueue,
    setRepeatMode
};