const { ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { descriptionEmbed } = require('../utils/embedMsg.js');
const { playQuery } = require('../utils/playSong.js');

const MAX_SEARCH_RESULTS = 25;
const MAX_CHOICE_NAME_LENGTH = 100;
const MAX_OPTION_DESCRIPTION_LENGTH = 100;

function trimText(text, maxLength) {
    if (!text || text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength - 3)}...`;
}

function createSearchEmbed(query, tracks) {
    const topTrack = tracks[0];

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Select a Song')
        .setDescription(`Search results for **${query}**`);

    if (topTrack?.thumbnail) {
        embed.setThumbnail(topTrack.thumbnail);
    }

    return embed;
}

function createSearchResultsRow(interaction, tracks) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`search:select:${interaction.user.id}`)
        .setPlaceholder('Choose a song to play')
        .addOptions(
            tracks.slice(0, MAX_SEARCH_RESULTS).map((track, index) => {
                const option = {
                    label: trimText(track.title || `Result ${index + 1}`, MAX_CHOICE_NAME_LENGTH),
                    value: track.url,
                };

                const description = trimText([track.author, track.duration].filter(Boolean).join(' - '), MAX_OPTION_DESCRIPTION_LENGTH);

                if (description) {
                    option.description = description;
                }

                return option;
            })
        );

    return new ActionRowBuilder().addComponents(selectMenu);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search YouTube and choose a song to play')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song you want to search for')
                .setRequired(true)),

    async execute(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getString('query');

        await interaction.deferReply();

        try {
            const result = await player.search(query, {
                requestedBy: interaction.user,
            });

            if (!result.hasTracks()) {
                await interaction.editReply({ embeds: [descriptionEmbed(`No results found for ${query}.`)] });
                return;
            }

            const tracks = result.tracks.filter((track) => track.url).slice(0, MAX_SEARCH_RESULTS);

            await interaction.editReply({
                embeds: [createSearchEmbed(query, tracks)],
                components: [createSearchResultsRow(interaction, tracks)],
            });
        } catch (e) {
            console.error('Search failed\n', e);
            await interaction.editReply({ embeds: [descriptionEmbed(`Search failed: ${e.message || e}`)], components: [] });
        }
    },

    async handleSelection(interaction) {
        const [, , requesterId] = interaction.customId.split(':');

        if (requesterId && requesterId !== interaction.user.id) {
            await interaction.reply({ embeds: [descriptionEmbed('Only the person who searched can choose from this menu.')], ephemeral: true });
            return;
        }

        const channel = interaction.member.voice.channel;

        if (!channel) {
            await interaction.reply({ embeds: [descriptionEmbed('Join a voice channel before choosing a song.')], ephemeral: true });
            return;
        }

        const query = interaction.values[0];
        await interaction.deferReply();

        try {
            await interaction.message.edit({ components: [] }).catch(() => null);
            const embed = await playQuery(interaction, channel, query);
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error('Selection playback failed\n', e);
            await interaction.editReply({ embeds: [descriptionEmbed(`Something went wrong: ${e.message || e}`)] });
        }
    }
};
