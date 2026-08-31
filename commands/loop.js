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
                .setDescription('Loop type')
                .setRequired(true)
                .setChoices(
                    {name : 'Song', value : 'song'},
                    {name : 'Playlist', value : 'playlist'},
                )
        ),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (!channel){
            return interaction.reply({ embeds: [descriptionEmbed("Join a voice channel before using /loop.")], ephemeral: true });
        }

        const queue = useQueue(interaction.guild.id);
        
        if (!validQueue(queue)){
            await interaction.reply({ embeds: [descriptionEmbed("No song is currently playing.")], ephemeral: true });
            return
        }

        const loopType = interaction.options.getString('type');

        const loopStatusString = await setRepeatMode(interaction, queue, loopType);
        await interaction.reply({ embeds: [descriptionEmbed(loopStatusString)], ephemeral: true });
    }
};
