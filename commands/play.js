const { SlashCommandBuilder } = require('discord.js');
const { descriptionEmbed } = require('../utils/embedMsg.js');
const { playQuery } = require('../utils/playSong.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search text or a YouTube URL')
                .setRequired(true)),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;

        if (!channel) {
            await interaction.reply({ embeds: [descriptionEmbed('Join a voice channel before using /play.')], ephemeral: true });
            return;
        }

        const query = interaction.options.getString('query');
        await interaction.deferReply();

        try {
            const embed = await playQuery(interaction, channel, query);
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error('Something went wrong\n', e);
            await interaction.editReply({ embeds: [descriptionEmbed(`Something went wrong: ${e.message || e}`)] });
        }
    }
};
