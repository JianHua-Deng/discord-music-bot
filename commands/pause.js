const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { validQueue } = require('../utils/utils.js');
const { createActionRow } = require('../utils/playbackButtons.js');
const { descriptionEmbed } = require('../utils/embedMsg.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current Song'),

    async execute(interaction){
        const channel = interaction.member.voice.channel;
        if (!channel){
            return interaction.reply({embeds: [descriptionEmbed("What are you trying to pause, you aren't even in a voice channel lil bro 🫵😂")]});
        }

        const queue = useQueue(interaction.guild.id);

        if (!validQueue(queue)){
            return interaction.reply({embeds: [descriptionEmbed("No song is currently in queue, you pasuing nothin lil bro 🫵😂")]});
        }

        try {
            queue.node.setPaused(!queue.node.isPaused());
            await interaction.update({
                content : queue.node.isPaused() ? `Paused ${queue.currentTrack}` : `Playing ${queue.currentTrack}`,
                components : [createActionRow(interaction.guild.id, false)]
            });
        } catch (error) {
            return interaction.reply({embeds: [descriptionEmbed(`Failed to clear playlist: ${error.message}`)], ephemeral: true});
        }


    }
};