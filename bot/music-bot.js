const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, REST, Routes, Collection} = require("discord.js");
const { Player, useQueue } = require("discord-player");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { validQueue, inChannel, setRepeatMode, clearPlaylist, disablePreviousMsgBtn } = require('../utils/utils');
const { createActionRow } = require('../utils/playbackButtons');
const { skipEmbedMsg, playStartEmbedMsg, descriptionEmbed } = require('../utils/embedMsg');
require('dotenv').config();

class MusicBot {
    constructor() {
        this.token = process.env.TOKEN;
        this.clientId = process.env.CLIENT_ID;
        
        this.client = new Client({
            intents: [
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.Guilds
            ]
        });

        this.client.commands = new Collection();
        
        this.player = new Player(this.client, {
            ytdlOptions: {
                quality: "highestaudio",
                highWaterMark: 1 << 25
            },
            connectionTimeout: 120000,
        });

        this.initializeBot();
    }

    async initializeBot() {
        // Register YouTube extractor
        this.player.extractors.register(YoutubeiExtractor, {});
        
        // Set up event handlers
        this.setupClientEvents();
        this.setupPlayerEvents();
        
        // Login
        await this.login();
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, '..', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                this.client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    async deployCommands() {
        const commands = this.client.commands.map(command => command.data.toJSON());
        const rest = new REST().setToken(this.token);

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            const guilds = this.client.guilds.cache.map(guild => guild.id);

            for (const id of guilds) {
                try {
                    const data = await rest.put(
                        Routes.applicationCommands(this.clientId, id),
                        { body: commands }
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

    setupClientEvents() {
        this.client.once("ready", async () => {
            console.log(`Bot is ready as ${this.client.user.tag}!`);
            await this.loadCommands();
            await this.deployCommands();
        });

        this.client.on('interactionCreate', this.handleInteraction.bind(this));
    }

    setupPlayerEvents() {
        this.player.events
            .on('error', this.handlePlayerError.bind(this))
            .on('playerError', this.handlePlayerConnectionError.bind(this))
            .on('playerStart', this.handlePlayerStart.bind(this))
            .on('disconnect', this.handleDisconnect.bind(this));
    }

    //Check if its a command interaction or a button interaction
    async handleInteraction(interaction) {
        if (interaction.isCommand()) {
            await this.handleCommandInteraction(interaction);
        } else if (interaction.isButton()) {
            await this.handleButtonInteraction(interaction);
        }
    }

    async handleCommandInteraction(interaction) {
        const command = this.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const response = { 
                content: 'There was an error while executing this command!', 
                ephemeral: true 
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    }

    async handleButtonInteraction(interaction) {
        const { customId } = interaction;
        const queue = useQueue(interaction.guild.id);
        const channel = interaction.member.voice.channel;

        if (!validQueue(queue) || !inChannel(channel)) {
            return;
        }

        const buttonHandlers = {
            'playpause': async () => {
                queue.node.setPaused(!queue.node.isPaused());
                await interaction.update({ components: [createActionRow(interaction.guild.id, false)] });
            },
            'skip': async () => {
                const currentSong = queue.currentTrack;
                queue.node.skip();
                await interaction.reply({embeds: [skipEmbedMsg(currentSong, queue.metadata.requester)]});
            },
            'loopSong': async () => {
                await setRepeatMode(interaction, queue, 'song');
                await interaction.deferUpdate();//DeferUpdate so that we dont have to reply in order to process
            },
            'loopPlaylist': async () => {
                await setRepeatMode(interaction, queue, 'playlist');
                await interaction.deferUpdate();//DeferUpdate so that we dont have to reply in order to process
            },
            'clear': async () => {
                await clearPlaylist(interaction, queue);
            }
        };

        try {
            if (buttonHandlers[customId]) {
                await buttonHandlers[customId]();
            } else {
                console.log('Unknown button pressed:', customId);
                await interaction.reply({ embeds: ['Unknown button interaction'], ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ embeds: [`Failed to execute ${customId} action`], ephemeral: true });
        }
    }

    async handlePlayerStart(queue, track) {
        const channel = queue.metadata.channel;
        await disablePreviousMsgBtn(queue);
        
        try {
            const message = await channel.send({
                embeds: [playStartEmbedMsg(queue, track)],
                components: [createActionRow(queue.guild.id, false)]
            });
            queue.metadata.latestMessage = message;
        } catch (error) {
            console.error('Failed to send track start message:', error);
        }
    }

    handlePlayerError(queue, error) {
        console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
    }

    handlePlayerConnectionError(queue, error) {
        console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
    }

    async handleDisconnect(queue) {
        await disablePreviousMsgBtn(queue);
        await queue.metadata.channel.send({embeds: [descriptionEmbed(`No song are left in the queue, I have to leave now, I'll always be you skibidi pookie bear though! 😘`)]});
    }

    async login() {
        try {
            await this.client.login(this.token);
        } catch (e) {
            if (e.message === 'An invalid token was provided.') {
                console.error('❌ Invalid Token Provided! ❌ \nChange the token in the .env file.\n');
            } else {
                console.error('❌ An error occurred while trying to login to the bot! ❌\n', e);
            }
            process.exit(1);
        }
    }
}

module.exports = MusicBot;