const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { inChannel, validQueue, setRepeatMode, clearPlaylist } = require('../utils/utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription("Clear current Playlist"),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (!inChannel(channel)){
            return interaction.reply("You are not even connected to a voice channel, what are you trying to clear lil bro 🫵😂");
        }

        const queue = useQueue(interaction.guild.id);
        
        if (!validQueue(queue)){
            return interaction.reply("No Song is Currently Playing");
        }

        await clearPlaylist(interaction, queue, 'reply');
    }
};