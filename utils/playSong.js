const { EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');
const { validQueue } = require('./utils.js');

function getQueuePosition(queue) {
    return validQueue(queue) ? queue.tracks.size || 1 : 1;
}

function createQueuedEmbed(interaction, track) {
    const queue = useQueue(interaction.guild.id);

    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(track.title)
        .setURL(track.url)
        .setAuthor({
            name: `Song added to the queue as #${getQueuePosition(queue)}`,
            iconURL: interaction.user.avatarURL()
        })
        .setThumbnail(track.thumbnail)
        .addFields({ name: 'Duration', value: track.duration, inline: true });
}

async function playQuery(interaction, channel, query) {
    const player = useMainPlayer();
    const { track } = await player.play(channel, query, {
        nodeOptions: {
            metadata: {
                channel: interaction.channel,
                latestMessage: null,
                lastTrack: '',
                requester: interaction.user,
            },
            bufferingTimeout: 15000,
            leaveOnStop: false,
            leaveOnEmpty: true,
            skipOnNoStream: true,
        }
    });

    return createQueuedEmbed(interaction, track);
}

module.exports = {
    playQuery,
};
