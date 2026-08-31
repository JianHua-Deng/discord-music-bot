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
            return interaction.reply({ embeds: [descriptionEmbed("Join a voice channel before using /pause.")], ephemeral: true });
        }

        const queue = useQueue(interaction.guild.id);

        if (!validQueue(queue)){
            return interaction.reply({ embeds: [descriptionEmbed("No song is currently playing.")], ephemeral: true });
        }

        try {
            queue.node.setPaused(!queue.node.isPaused());
            await interaction.reply({
                embeds: [descriptionEmbed(queue.node.isPaused() ? `Paused ${queue.currentTrack.title}` : `Resumed ${queue.currentTrack.title}`)],
                components: [createActionRow(interaction.guild.id, false)],
                ephemeral: true
            });
        } catch (error) {
            return interaction.reply({ embeds: [descriptionEmbed(`Failed to pause or resume: ${error.message}`)], ephemeral: true });
        }


    }
};
