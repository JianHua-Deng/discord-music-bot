const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { validQueue, setRepeatMode, clearPlaylist } = require('../utils/utils.js');
const { descriptionEmbed } = require('../utils/embedMsg.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription("Clear current Playlist"),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (!channel){
            return interaction.reply({embeds:[descriptionEmbed("You are not even connected to a voice channel, what are you trying to clear lil bro 🫵😂")]});
        }

        const queue = useQueue(interaction.guild.id);
        
        if (!validQueue(queue)){
            return interaction.reply({embeds: [descriptionEmbed("No Song is Currently Playing, you clearing nothin lil bro 🫵😂")]});
        }

        await clearPlaylist(interaction, queue);
    }
};