const { SlashCommandBuilder } = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');
const { inChannel, validQueue, setRepeatMode } = require('../utils/utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription("Loop the current Song")
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Loop type (Song or Playlist')
                .setChoices(
                    {name : 'Song', value : 'song'},
                    {name : 'Playlist', value : 'playlist'},
                )
        ),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (!inChannel(channel)){
            return interaction.reply("You are not even connected to a voice channel, what are you trying to loop lil bro 🫵😂");
        }

        const queue = useQueue(interaction.guild.id);
        
        if (!validQueue(queue)){
            return interaction.reply("No Song is Currently Playing");
        }

        const loopType = interaction.options.getString('type');

        await setRepeatMode(interaction, queue, loopType, 'reply');
    }
};