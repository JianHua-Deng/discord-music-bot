const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { inChannel, validQueue } = require('../utils/utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription("Skip current song"),

    async execute(interaction) {

        const channel = interaction.member.voice.channel;
        if (!inChannel(channel)){
            return interaction.reply("You are not even connected to a voice channel, what are you trying to skip lil bro 🫵😂");
        }

        const queue = useQueue(interaction.guild.id);
        

        if (!validQueue(queue)){
            return interaction.reply("No Song is Currently Playing");
        }

        try {

            let currentSong = queue.currentTrack;

            const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(currentSong.title)
            .setURL(currentSong.url)
            .setAuthor({ 
                name: `Skipped ${currentSong.title}`,
                iconURL: interaction.user.avatarURL()
            })
            .setThumbnail(currentSong.thumbnail)

            await queue.node.skip();
            await interaction.reply({embeds: [embed]});
        } catch (error){ 
            return interaction.reply(`Failed to skip Song: ${error.message}`);
        }


    }
};