const { SlashCommandBuilder } = require('discord.js');
const { useQueue} = require('discord-player');
const { validQueue, setRepeatMode } = require('../utils/utils.js');
const { descriptionEmbed } = require('../utils/embedMsg.js');

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
        if (!channel){
            return interaction.reply({embeds: [descriptionEmbed("You are not even connected to a voice channel, what are you trying to loop lil bro 🫵😂")]});
        }

        const queue = useQueue(interaction.guild.id);
        
        if (!validQueue(queue)){
            await interaction.reply({embeds: [descriptionEmbed("Nothing in queue, you looping nothin lil bro 🫵😂")]});
            return
        }

        const loopType = interaction.options.getString('type');

        loopStatusString = await setRepeatMode(interaction, queue, loopType);
        await interaction.reply({embeds: [descriptionEmbed(loopStatusString)], ephemeral: true});
    }
};