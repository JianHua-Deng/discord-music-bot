const fs = require('node:fs');
const path = require('node:path');
const ffmpegPath = require('ffmpeg-static');
const { Client, GatewayIntentBits, REST, Routes, Collection, Events } = require("discord.js");
const { Player, useQueue } = require("discord-player");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { Log: YouTubeLog, Parser: YouTubeParser } = require('youtubei.js');
//const { DeezerExtractor } = require("discord-player-deezer");
const { validQueue, setRepeatMode, clearPlaylist, disablePreviousMsgBtn } = require('../utils/utils');
const { createActionRow } = require('../utils/playbackButtons');
const { skipEmbedMsg, playStartEmbedMsg, descriptionEmbed } = require('../utils/embedMsg');
require('dotenv').config();

class MusicBot {
    constructor() {
        this.token = process.env.TOKEN;
        this.clientId = process.env.CLIENT_ID;
        this.guildId = process.env.GUILD_ID;
        
        this.client = new Client({
            intents: [
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.Guilds
            ]
        });

        this.client.commands = new Collection();
        
        this.player = new Player(this.client, {
            connectionTimeout: 120000,
            ffmpegPath,
            skipFFmpeg: false,
        });

        this.initializeBot();
    }

    async initializeBot() {
        this.setupYouTubeLogging();
        this.setupExtractorEvents();

        const youtubeOptions = {
            streamOptions: {
                highWaterMark: 1 << 25,
            },
            useYoutubeDL: process.env.YT_USE_YTDLP !== 'false',
            logLevel: process.env.YT_LOG_LEVEL || 'NONE',
        };

        if (process.env.YT_COOKIE) {
            youtubeOptions.cookie = process.env.YT_COOKIE;
        }

        await this.player.extractors.register(YoutubeiExtractor, youtubeOptions);
        //this.player.extractors.register(DeezerExtractor, {});
        
        // Set up event handlers
        this.setupClientEvents();
        this.setupPlayerEvents();
        
        // Login
        await this.login();
    }

    setupYouTubeLogging() {
        const levels = YouTubeLog.Level;
        const levelName = (process.env.YTJS_LOG_LEVEL || 'ERROR').toUpperCase();
        const level = levels[levelName] ?? levels.ERROR;

        YouTubeLog.setLevel(level);
        YouTubeParser.setParserErrorHandler((error) => {
            const shouldLogParserWarning = process.env.YT_PARSER_WARNINGS === 'true';
            const isKnownNonFatalParserWarning = ['class_not_found', 'class_changed'].includes(error.error_type);

            if (shouldLogParserWarning || !isKnownNonFatalParserWarning) {
                console.warn(`[YOUTUBEJS][Parser] ${error.classname}: ${error.error_type}`);
            }
        });
    }

    setupExtractorEvents() {
        this.player.extractors.on('error', (_context, extractor, error) => {
            console.error(`Extractor ${extractor.identifier} failed:`, error);
        });
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
            const guilds = this.guildId ? [this.guildId] : this.client.guilds.cache.map(guild => guild.id);

            for (const id of guilds) {
                try {
                    const data = await rest.put(
                        Routes.applicationGuildCommands(this.clientId, id),
                        { body: commands }
                    );
                    console.log(`Successfully reloaded ${data.length} application (/) commands for guild ${id}.`);
                } catch (error) {
                    console.log(`Error deploying command for ${id}`, error);
                }
            }
        } catch (error) {
            console.error('Error deploying commands:', error);
        }
    }

    setupClientEvents() {
        this.client.once(Events.ClientReady, async () => {
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
            .on('disconnect', this.handleDisconnect.bind(this))
            .on('emptyChannel', this.handleEmptyQueue.bind(this));
    }

    //Check if its a command interaction or a button interaction
    async handleInteraction(interaction) {
        if (interaction.isChatInputCommand()) {
            await this.handleCommandInteraction(interaction);
        } else if (interaction.isStringSelectMenu()) {
            await this.handleStringSelectMenuInteraction(interaction);
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

    async handleStringSelectMenuInteraction(interaction) {
        const [commandName] = interaction.customId.split(':');
        const command = this.client.commands.get(commandName);

        if (!command || typeof command.handleSelection !== 'function') {
            await interaction.reply({ embeds: [descriptionEmbed('Unknown menu interaction.')], ephemeral: true });
            return;
        }

        try {
            await command.handleSelection(interaction);
        } catch (error) {
            console.error(`Select menu failed for ${interaction.customId}:`, error);
            const response = {
                embeds: [descriptionEmbed(`Failed to handle menu selection: ${error.message}`)],
                ephemeral: true,
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

        if (!validQueue(queue)) {
            await interaction.reply({ embeds: [descriptionEmbed('Nothing is playing right now.')], ephemeral: true });
            return;
        }

        if (!channel) {
            await interaction.reply({ embeds: [descriptionEmbed('Join the voice channel before using playback controls.')], ephemeral: true });
            return;
        }

        if (queue.channel && channel.id !== queue.channel.id) {
            await interaction.reply({ embeds: [descriptionEmbed('You need to be in my voice channel to use playback controls.')], ephemeral: true });
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
                await interaction.reply({ embeds: [skipEmbedMsg(currentSong, interaction.user)] });
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
                await interaction.reply({ content: 'Unknown button interaction', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            const response = { embeds: [descriptionEmbed(`Failed to execute ${customId} action: ${error.message}`)], ephemeral: true };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
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
        await queue.metadata.channel.send({ embeds: [descriptionEmbed(`No songs are left in the queue, so I left the voice channel.`)] });
    }

    async handleEmptyQueue(queue) {
        await disablePreviousMsgBtn(queue);
        await queue.metadata.channel.send({ embeds: [descriptionEmbed(`The voice channel is empty, so I left.`)] });
    }

    async login() {
        try {
            if (!this.token || !this.clientId) {
                throw new Error('Missing TOKEN or CLIENT_ID in environment.');
            }

            await this.client.login(this.token);
        } catch (e) {
            if (e.message === 'An invalid token was provided.') {
                console.error('Invalid token provided. Change TOKEN in the .env file.');
            } else if (e.message === 'Missing TOKEN or CLIENT_ID in environment.') {
                console.error(`${e.message} Create a .env file from .env.example and fill in the values.`);
            } else {
                console.error('An error occurred while trying to login to the bot:\n', e);
            }
            process.exit(1);
        }
    }
}

module.exports = MusicBot;
