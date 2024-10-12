const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription("Skip current song"),

    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (!channel){
            return interaction.reply("You are not even connected to a voice channel, what are you trying to skip lil bro 🫵😂");
        }

        console.log(interaction.guild.id)
        const queue = useQueue(interaction.guild.id);
        
        /*
        if (!player.isPlaying) {
            return interaction.reply("No Song is Currently Playing");
        }
        */

        if (!queue || !queue.isPlaying()){
            return interaction.reply("No Song is Currently Playing");
        }

        try {
            let currentSong = queue.currentTrack;
            queue.node.skip();
            return interaction.reply(`Skipped ${currentSong}`);
        } catch (error){ 
            return interaction.reply(`Failed to skip Song: ${error.message}`);
        }


    }
};