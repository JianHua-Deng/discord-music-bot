const { SlashCommandBuilder } = require('discord.js');
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
                    },
                    bufferingTimeout: 15000,
                    leaveOnStop: false,
                    leaveOnEmpty: true,
                    skipOnNoStream: true,
                }
            });

            if(validQueue(queue)){
                await interaction.followUp({
                    content: `Enqueued **${track.title}** as the #${queue.tracks.size} in the queue`,
                });
            } else {
                await interaction.followUp({
                    content: `Added **${track.title}** to the start of the queue`,
                });
            }


        } catch (e) {
            // let's return error if something failed
            await interaction.followUp(`Something went wrong: ${e}`);
        }
    }
};