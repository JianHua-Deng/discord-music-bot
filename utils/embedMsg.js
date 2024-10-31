const {EmbedBuilder } = require("discord.js");

function playStartEmbedMsg(queue, track){
    return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(track.title)
    .setURL(track.url)
    .setAuthor({name: `Now Playing`})
    .setDescription(`From **${track.author}**`)
    .setThumbnail(track.thumbnail)
    .addFields({ name: 'Duration', value: track.duration, inline: true })
    .setFooter({
        text: `Requested by ${queue.metadata.requester.username}`,
        iconURL: queue.metadata.requester.avatarURL()
    });
}

function skipEmbedMsg(currentSong, user){
    return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(currentSong.title)
    .setURL(currentSong.url)
    .setAuthor({ 
        name: `Skipped ${currentSong.title}`,
        iconURL: user.avatarURL()
    })
    .setThumbnail(currentSong.thumbnail);
}

function descriptionEmbed(string){
    return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(string)
}

module.exports = {
    playStartEmbedMsg,
    skipEmbedMsg,
    descriptionEmbed,

}