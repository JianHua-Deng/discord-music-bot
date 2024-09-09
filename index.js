const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, REST, Routes, Collection } = require("discord.js");
const { Player } = require("discord-player");
const { YoutubeiExtractor } = require("discord-player-youtubei")
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
    }
});

// Register the YouTube extractor
player.extractors.register(YoutubeiExtractor, {})

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
        const data = await rest.put(
            Routes.applicationGuildCommands(clientID, guildID),
            { body: commands }
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

client.once("ready", async () => {
    console.log(`Bot is ready as ${client.user.tag}!`);
    guildID = client.guilds.cache.first()?.id;
    await loadCommands();
    await deployCommands();
    //await player.extractors.loadDefault();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

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
});

// Error handling

player.events.on('debug', console.log);

player.events.on('error', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});

player.events.on('playerStart', (queue, track) => {
    queue.metadata.channel.send(`Started playing **${track.title}**!`);
});

client.login(token).catch(e => {
    if (e.message === 'An invalid token was provided.') {
        console.error('❌ Invalid Token Provided! ❌ \nChange the token in the .env file.\n');
    } else {
        console.error('❌ An error occurred while trying to login to the bot! ❌\n', e);
    }
});

/*
// Helper function to load commands
async function getCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            // If it's a directory, read the commands inside it
            const subFiles = fs.readdirSync(filePath).filter(subFile => subFile.endsWith('.js'));
            for (const subFile of subFiles) {
                const subFilePath = path.join(filePath, subFile);
                const command = require(subFilePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] The command at ${subFilePath} is missing a required "data" or "execute" property.`);
                }
            }
        } else {
            // If it's a file, treat it as a command file
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    return commands;
}
*/