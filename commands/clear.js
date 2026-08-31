const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { validQueue, clearPlaylist } = require('../utils/utils.js');
const { descriptionEmbed } = require('../utils/embedMsg.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription("Clear current Playlist"),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (!channel){
            return interaction.reply({ embeds:[descriptionEmbed("Join a voice channel before using /clear.")], ephemeral: true });
        }

        const queue = useQueue(interaction.guild.id);
        
        if (!validQueue(queue)){
            return interaction.reply({ embeds: [descriptionEmbed("No song is currently playing.")], ephemeral: true });
        }

        await clearPlaylist(interaction, queue);
    }
};
