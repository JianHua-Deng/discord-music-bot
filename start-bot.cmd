@echo off
setlocal

set "BOT_DIR=C:\Users\dengj\Desktop\Personal Projects\discord-music-bot"
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
set "LOG_FILE=%BOT_DIR%\bot-startup.log"

cd /d "%BOT_DIR%"

>> "%LOG_FILE%" echo [%date% %time%] Starting Discord music bot
>> "%LOG_FILE%" echo Working directory: %CD%

if not exist "%NODE_EXE%" (
    >> "%LOG_FILE%" echo Node was not found at "%NODE_EXE%"
    exit /b 1
)

>> "%LOG_FILE%" "%NODE_EXE%" --version
>> "%LOG_FILE%" echo Running node index.js

"%NODE_EXE%" index.js >> "%LOG_FILE%" 2>>&1
