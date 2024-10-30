const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');
const { createActionRow } = require('../utils/playbackButtons');
const { inChannel, validQueue } = require('../utils/utils.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The song you want to play')
                .setRequired(true)),

    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        const queue = useQueue(interaction.guild.id)
        if (!channel) return interaction.reply("You are not connected to a voice channel");

        const query = interaction.options.getString('query'); //Getting the query string

        // defer the interaction as things can take time to process
        await interaction.deferReply();

        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        lastMessage: null, //initially to be none
                        lastTrack: '',
                        requester: interaction.user,
                    },
                    bufferingTimeout: 15000,
                    leaveOnStop: false,
                    leaveOnEmpty: true,
                    skipOnNoStream: true,
                }
            });

            const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(track.title)
            .setURL(track.url)
            .setAuthor({ 
                name: `Song added to the queue as #${validQueue(queue) ? queue.tracks.size : 0}`,
                iconURL: interaction.user.avatarURL()
            })
            .setThumbnail(track.thumbnail)
            .addFields({ name: 'Duration', value: track.duration, inline: true });

            await interaction.followUp({
                embeds: [embed],
            });

        } catch (e) {
            // let's return error if something failed
            await interaction.followUp(`Something went wrong: ${e}`);
        }
    }
};