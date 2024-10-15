const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, REST, Routes, Collection } = require("discord.js");
const { Player, useQueue } = require("discord-player");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { validQueue, inChannel, setRepeatMode, clearPlaylist, disablePreviousMsgBtn } = require('./utils/utils');
const { createActionRow } = require('./utils/playbackButtons');
require('dotenv').config()

const token = process.env.TOKEN;
const clientID = process.env.CLIENT_ID;
let guildID = null;

const client = new Client({
    intents: [
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();
const player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    },
    connectionTimeout: 120000, // Increase timeout (2 minutes)
});

// Register the YouTube extractor
player.extractors.register(YoutubeiExtractor, {})
//await player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');

async function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

async function deployCommands() {
    const commands = client.commands.map(command => command.data.toJSON());
    const rest = new REST().setToken(token);

    try {

        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const guilds = client.guilds.cache.map(guild => guild.id);

        //Deploying commands to all the servers the bot is in
        for (const id of guilds) {
            try {
                const data = await rest.put(
                    Routes.applicationCommands(clientID, id),
                    {body : commands}
                );
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                console.log(`Error deploying command for ${id}`, error);
            }
        }

        
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

client.once("ready", async () => {
    console.log(`Bot is ready as ${client.user.tag}!`);
    await loadCommands();
    await deployCommands();
    //await player.extractors.loadDefault();
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()){
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }

    }else if (interaction.isButton()){

            const {customId} = interaction;
            const queue = useQueue(interaction.guild.id);
            const channel = interaction.member.voice.channel;
            
            if(!validQueue(queue) || !inChannel(channel)){
                return
            }

            switch (customId){
                case 'playpause':
                    try {
                        queue.node.setPaused(!queue.node.isPaused());
                        await interaction.update({components : [createActionRow(interaction.guild.id, false)]});
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({content: 'Failed to Pause/Resume the track', ephemeral: true});
                    }
                    break;

                case 'skip':
                    try {
                        const currentSong = queue.currentTrack;
                        queue.node.skip();
                        await interaction.reply(`Skipped ${currentSong.title}`)
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({content: 'Failed to skip the track', ephemeral: true});
                    }

                    break;

                case 'loopSong':
                    await setRepeatMode(interaction, queue, 'song', 'update');
                    break;

                case 'loopPlaylist':

                    await setRepeatMode(interaction, queue, 'playlist', 'update')
                    break;

                case 'clear':
                    await clearPlaylist(interaction, queue, 'update');
                    break;

                default:
                    console.log('Unknown button pressed:', customId);
                    return interaction.reply({ content: 'Unknown button interaction', ephemeral: true });
            }

        
    }
});

// Error handling

//player.events.on('debug', console.log);

player.events.on('error', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});

player.events.on('playerStart', async (queue, track) => {
    const channel = queue.metadata.channel;

        // Find the last message with buttons and disable them
        await disablePreviousMsgBtn(queue);

        //send the message
        try {
            const message = await channel.send({
                content: `Now playing **${track.title}**`,
                components: [createActionRow(queue.guild.id, false)]
            });
            queue.metadata.lastMessage = message;
        } catch (error) {
            console.error('Failed to update buttons:', error);
            return interaction.reply({ content: 'Failed to disable buttons from the previous message:', ephemeral: true });
        }
    
});


player.events.on('disconnect', async (queue, track) => {
    // Disable all buttons in the previous message
    await disablePreviousMsgBtn(queue);
});

client.login(token).catch(e => {
    if (e.message === 'An invalid token was provided.') {
        console.error('❌ Invalid Token Provided! ❌ \nChange the token in the .env file.\n');
    } else {
        console.error('❌ An error occurred while trying to login to the bot! ❌\n', e);
    }
});