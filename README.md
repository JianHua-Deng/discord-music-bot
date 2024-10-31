# Discord Music Bot

A feature-rich Discord music bot built with discord.js and discord-player that plays high-quality music from YouTube.

## Features

* Play music from YouTube
* Interactive playback controls
* Queue management
* Loop songs or entire playlists
* Skip tracks
* Clear playlist
* Pause/Resume functionality
* Easy-to-use slash commands

## Getting Started

### Prerequisites

* Node.js 16.9.0 or higher
* npm (comes with Node.js)
* Discord account and a server where you have admin permissions

### Installation

1. Create a Discord Application
   * Go to [Discord Developer Portal](https://discord.com/developers/applications)
   * Click "New Application" and give it a name
   * Go to the "Bot" section and click "Add Bot"
   * Copy the bot token
   * Go to OAuth2 and copy the client ID
   * Under "Privileged Gateway Intents", enable:
     * Server Members Intent
     * Message Content Intent
     * Voice State Intent

2. Clone the repository

3. Create a `.env` file in the root directory
```env
TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
```

4. Invite the bot to your server
   * Go to OAuth2 > URL Generator in Discord Developer Portal
   * Select scopes: `bot` and `applications.commands`
   * Select bot permissions:
     * Send Messages
     * Embed Links
     * Connect
     * Speak
     * Use Voice Activity
   * Use the generated URL to invite the bot

5. Start the bot
```bash
node index.js
```

## Commands

* `/play <song>` - Play a song or add it to queue
* `/skip` - Skip current song
* `/queue` - View current playlist
* `/loop <type>` - Loop current song or playlist
* `/clear` - Clear current playlist
* `/stop` - Stop playback and clear queue

## Interactive Controls

* ⏯️ Play/Pause
* ⏭️ Skip
* 🔂 Loop Song
* 🔁 Loop Playlist
* 🗑️ Clear Queue

## Common Issues

* **Bot won't start**: Check if your `.env` file contains correct token and client ID
* **No audio**: Verify bot has correct voice channel permissions
* **Commands not working**: Ensure bot has necessary permissions and intents are enabled
* **Gateway Intent error**: Double-check that all required intents are enabled in Developer Portal

## Acknowledgments

* [discord.js](https://discord.js.org/)
* [discord-player](https://discord-player.js.org/)
* [Node.js](https://nodejs.org/)