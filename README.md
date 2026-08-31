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

* Node.js 22.12.0 or higher
* npm (comes with Node.js)
* Discord account and a server where you have admin permissions

### Installation

1. Create a Discord Application
   * Go to [Discord Developer Portal](https://discord.com/developers/applications)
   * Click "New Application" and give it a name
   * Go to the "Bot" section and click "Add Bot"
   * Copy the bot token
   * Go to OAuth2 and copy the client ID
   * No privileged gateway intents are required. The bot only uses guild and voice-state events.

2. Clone the repository

3. Install dependencies
```bash
npm install
```

4. Create a `.env` file in the root directory
```env
TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=optional_dev_server_id
YT_COOKIE=optional_youtube_cookie
YT_USE_YTDLP=true
YTJS_LOG_LEVEL=ERROR
YT_PARSER_WARNINGS=false
```

`GUILD_ID` registers slash commands instantly to one server. If omitted, the bot registers commands for every server it is in after login.

`YT_COOKIE` is optional for ordinary public videos, but recommended because YouTube often blocks unauthenticated third-party playback. Treat it like a password.

`YT_USE_YTDLP=true` uses the yt-dlp based stream path. Keep it enabled unless you are specifically debugging the direct YouTube stream extractor.

`YTJS_LOG_LEVEL=ERROR` and `YT_PARSER_WARNINGS=false` keep noisy nonfatal YouTube parser messages out of the console.

5. Invite the bot to your server
   * Go to OAuth2 > URL Generator in Discord Developer Portal
   * Select scopes: `bot` and `applications.commands`
   * Select bot permissions:
     * Send Messages
     * Embed Links
     * Connect
     * Speak
     * Use Voice Activity
   * Use the generated URL to invite the bot

6. Start the bot
```bash
npm start
```

For development with restart-on-change:
```bash
npm run dev
```

## Windows Auto-Start

Use `start-bot.cmd` with Task Scheduler if you want the bot to launch automatically.

Task Scheduler action:

* Program/script: `C:\Windows\System32\cmd.exe`
* Add arguments: `/c ""C:\path\to\discord-music-bot\start-bot.cmd""`
* Start in: `C:\path\to\discord-music-bot`

For first setup, use **Run only when user is logged on**. After that works, you can switch the task to **Run whether user is logged on or not** or run it as `SYSTEM`.

Startup logs are written to:

```text
C:\path\to\discord-music-bot\bot-startup.log
```

Replace `C:\path\to\discord-music-bot` with the folder where you cloned this repository.

## Commands

* `/play <song>` - Play the first matching result immediately. Pasted YouTube links play directly.
* `/search <song>` - Search YouTube and choose a result from a menu.
* `/skip` - Skip current song
* `/loop <type>` - Loop current song or playlist
* `/clear` - Clear current playlist

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
* **YouTube search works but playback fails**: Keep `YT_USE_YTDLP=true`, refresh `YT_COOKIE`, and restart the bot
* **Dependency issues**: Run `npm install`, then `npm test` to verify the local install

## Acknowledgments

* [discord.js](https://discord.js.org/)
* [discord-player](https://discord-player.js.org/)
* [Node.js](https://nodejs.org/)
