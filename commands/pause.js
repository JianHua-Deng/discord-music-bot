const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { inChannel, validQueue } = require('../utils/utils.js');
const { createActionRow } = require('../utils/playbackButtons.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current Song'),

    async execute(interaction){
        const channel = interaction.member.voice.channel;
        if (!inChannel(channel)){
            return interaction.reply("What are you trying to pause, you aren't even in a voice channle lil bro 🫵😂");
        }

        const queue = useQueue(interaction.guild.id);

        if (!validQueue(queue)){
            return interaction.reply("No song is currently in queue, you pasuing nothin lil bro");
        }

        try {
            queue.node.setPaused(!queue.node.isPaused());
            await interaction.update({
                content : queue.node.isPaused() ? `Paused ${queue.currentTrack}` : `Playing ${queue.currentTrack}`,
                components : [createActionRow(interaction.guild.id, false)]
            });
        } catch (error) {
            return interaction.reply(`Failed to clear playlist: ${error.message}`);
        }


    }
};