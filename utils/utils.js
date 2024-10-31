//const { useQueue, QueueRepeatMode } = require("discord-player");
const { QueueRepeatMode } = require('discord-player');
const { createActionRow } = require('./playbackButtons');
const { descriptionEmbed } = require('./embedMsg');

//Check if queue has been initialized, and if its playing
function validQueue(queue){
    if (!queue || !queue.isPlaying()){
        return false;
    }
    return true;
};

const updateButtons = async (queue) => {
    if (queue) {
        try{
            queue.metadata.latestMessage.edit({
                components: [createActionRow(queue.guild.id , false)]
            })
        } catch (error) {
            
        }
    }
    
}

const setRepeatMode = async (interaction, queue, repeatType) => {
    try{
        let currentSong = queue.currentTrack;
        let loopStatus;

        if (repeatType === 'song') {
            // Toggle between TRACK and OFF for 'loop song'
            if (queue.repeatMode === QueueRepeatMode.TRACK) {
                queue.setRepeatMode(QueueRepeatMode.OFF);
                loopStatus = `Stopped looping: ${currentSong.title}`;
            } else {
                queue.setRepeatMode(QueueRepeatMode.TRACK);
                loopStatus = `Looping: ${currentSong.title}`;
            }
        } else if (repeatType === 'playlist') {
            // Toggle between QUEUE and OFF for 'loop playlist'
            if (queue.repeatMode === QueueRepeatMode.QUEUE) {
                queue.setRepeatMode(QueueRepeatMode.OFF);
                loopStatus = "Stopped looping the playlist";
            } else {
                queue.setRepeatMode(QueueRepeatMode.QUEUE);
                loopStatus = "Looping playlist";
            }
        }

        //await interaction.deferUpdate();
        // Update buttons to reflect the new repeat mode state
        await updateButtons(queue);
        return loopStatus; //return loopStatus in the case when user uses command to control loop mode with loop.js

    } catch (error) {
        return interaction.reply({embeds: [descriptionEmbed(`Failed to clear playlist: ${error.message}`)]});
    }
}

const clearPlaylist = async (interaction, queue) => {
    try{
        queue.clear();
        await interaction.reply({ embeds: [descriptionEmbed(`Cleared queue after current Song. Let me be your little pookie bear now 😘`)], ephemeral: true });
    } catch (error){
        await interaction.reply({ embeds: [descriptionEmbed(`Failed to clear playlist: ${error.message}`)]});
    }
}

//Disable the buttons of previous messaged passed in from
const disablePreviousMsgBtn = async (queue) => {
    if (queue.metadata.latestMessage){
        try {
            await queue.metadata.latestMessage.edit({
                components: [createActionRow(queue.guild.id, true)] // Pass true to disable buttons
            });
        } catch (error) {
            console.error('Failed to disable buttons from the previous message:', error);
        }
    }
}

module.exports = {
    validQueue,
    setRepeatMode,
    clearPlaylist,
    disablePreviousMsgBtn,
};